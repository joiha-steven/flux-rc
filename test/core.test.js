import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultConfig, normalizeConfig, ConfigError, configToFields, encodeFrames, checksum, ProtocolError,
  framesToGif, buildProgram, validateConfig, parseSource, modeCode, describeMode, LEVELS, FIELD_NAMES, scales,
} from '../src/core/index.js';

const signal = (color, double, onMs, offMs) => ({ type: 'signal', color, double, onMs, offMs });
const withConfig = (patch) => {
  const c = defaultConfig();
  patch(c);
  return c;
};
const codes = (issues) => issues.map((i) => i.code);

test('checksum is mod 255 when the sum exceeds 255', () => {
  const fields = [63, 63, 63, 63, 63, 63, 63, 63, 31, 63, 127, 63, 63, 255, 255];
  assert.equal(fields.reduce((a, b) => a + b, 0), 1361);
  assert.equal(checksum(fields), 86); // 1361 - 5 * 255
  assert.equal(checksum([255, ...Array(14).fill(null)]), 0);
  assert.equal(checksum([44, ...Array(14).fill(null)]), 44);
  assert.equal(checksum([63, 63, 63, 63, 63, ...Array(10).fill(null)]), 60);
});

test('packet structure: lead, reset without OFF, header, gap, null fields, checksum', () => {
  const frames = encodeFrames(Array(15).fill(null));
  assert.deepEqual(frames.slice(0, 3), [{ color: 'lead', cs: 300 }, { color: 'white', cs: 34 }, { color: 'black', cs: 30 }]);
  // header 151 = 10010111
  const header = frames.slice(3, 19).filter((f) => f.color === 'white').map((f) => (f.cs === 14 ? 1 : 0)).join('');
  assert.equal(header, '10010111');
  assert.deepEqual(frames.slice(18, 20), [{ color: 'black', cs: 10 }, { color: 'black', cs: 30 }]);
  assert.deepEqual(frames.slice(20, 22), [{ color: 'white', cs: 24 }, { color: 'black', cs: 10 }]);
  assert.deepEqual(frames.at(-1), { color: 'black', cs: 10 });
});

test('encodeFrames rejects values that do not fit the field width', () => {
  const base = () => Array(15).fill(null);
  const f = base(); f[0] = 64;
  assert.throws(() => encodeFrames(f), ProtocolError);
  const g = base(); g[8] = 32;
  assert.throws(() => encodeFrames(g), /Field 8/);
  const h = base(); h[10] = 128;
  assert.throws(() => encodeFrames(h), ProtocolError);
  const n = base(); n[1] = -1;
  assert.throws(() => encodeFrames(n), ProtocolError);
  const fl = base(); fl[1] = 1.5;
  assert.throws(() => encodeFrames(fl), ProtocolError);
  assert.throws(() => encodeFrames([1, 2]), /Expected 15 fields/);
  const max = base(); max[10] = 127; max[13] = 255; max[14] = 255;
  assert.doesNotThrow(() => encodeFrames(max));
});

test('framesToGif starts and ends correctly', () => {
  const gif = framesToGif(encodeFrames(Array(15).fill(null)));
  assert.equal(Buffer.from(gif.slice(0, 6)).toString(), 'GIF89a');
  assert.equal(gif.at(-1), 0x3b);
});

test('mode codes', () => {
  assert.equal(modeCode({ type: 'level', level: 1 }), 31);
  assert.equal(modeCode({ type: 'level', level: 32 }), 62);
  assert.equal(modeCode({ type: 'afterburning' }), 63);
  assert.equal(modeCode({ type: 'moonlight' }), 1);
  assert.equal(modeCode({ type: 'sos' }), 2);
  assert.equal(modeCode({ type: 'strobe' }), 4);
  assert.equal(modeCode({ type: 'beacon' }), 29);
});

test('signal code formula, including wrap to 63', () => {
  assert.equal(modeCode(signal('red', false, 64, 3000)), 27);
  assert.equal(modeCode(signal('white', true, 64, 3000)), 30);
  assert.equal(modeCode(signal('red', false, 250, 1000)), 15);
  assert.equal(modeCode(signal('red', false, 250, 32)), 63);
  assert.equal(modeCode(signal('white', false, 64, 32)), modeCode({ type: 'strobe' }));
  assert.equal(modeCode(signal('red', true, 64, 3000)), modeCode({ type: 'beacon' }));
});

test('compaction removes unused modes and pads with null', () => {
  const c = withConfig((x) => { x.single.modes[1] = null; });
  assert.deepEqual(configToFields(c).slice(0, 4), [36, 51, 58, null]);
});

test('mirroring: one group off repeats the other, both off gives eight nulls', () => {
  const single = defaultConfig();
  const f = configToFields(single);
  assert.deepEqual(f.slice(4, 8), f.slice(0, 4));
  const dualOnly = withConfig((x) => { x.single.enabled = false; x.dual.enabled = true; });
  const d = configToFields(dualOnly);
  assert.deepEqual(d.slice(0, 4), [36, 44, 51, 63]);
  assert.deepEqual(d.slice(4, 8), d.slice(0, 4));
  const none = withConfig((x) => { x.single.enabled = false; });
  assert.deepEqual(configToFields(none).slice(0, 8), Array(8).fill(null));
});

test('options field: sums, NULL when 0, CR123A only with dual enabled', () => {
  const opts = (patch) => configToFields(withConfig(patch))[8];
  assert.equal(opts(() => {}), 29);
  assert.equal(opts((c) => { c.memory = 'none'; c.protection = false; c.stretch = false; }), null);
  assert.equal(opts((c) => { c.memory = 'standard'; c.protection = false; c.stretch = false; }), 8);
  assert.equal(opts((c) => { c.dual.cells = 'cr123a'; }), 29);
  assert.equal(opts((c) => { c.dual.cells = 'cr123a'; c.dual.enabled = true; }), 31);
  assert.equal(opts((c) => { c.dual.enabled = true; c.memory = 'none'; c.protection = false; c.stretch = false; c.dual.cells = 'cr123a'; }), 2);
});

test('advanced actions map to fields', () => {
  const f = (patch) => configToFields(withConfig(patch));
  assert.deepEqual(f(() => {}).slice(9), [null, null, null, null, null, null]);
  assert.equal(f((c) => { c.switchTimeout = { action: 'set', value: 11 }; })[9], 11);
  assert.equal(f((c) => { c.thermal = { action: 'none', value: 13 }; })[10], 127);
  assert.equal(f((c) => { c.thermal = { action: 'set', value: 13 }; })[10], 13);
  assert.equal(f((c) => { c.singleLimit = { action: 'set', value: 27 }; })[11], 27);
  assert.equal(f((c) => { c.dualLimit = { action: 'none', value: 31 }; })[12], 32);
  assert.equal(f((c) => { c.dualLimit = { action: 'set', value: 31 }; })[12], 31);
  assert.equal(f((c) => { c.pin = { action: 'set', digits: [4, 8, 7] }; })[13], 254);
  assert.equal(f((c) => { c.pin = { action: 'set', digits: [1, 1, 1] }; })[13], 0);
  assert.equal(f((c) => { c.bounce = { action: 'off', value: 179 }; })[14], 255);
  assert.equal(f((c) => { c.bounce = { action: 'set', value: 179 }; })[14], 179);
  assert.equal(FIELD_NAMES.length, 15);
});

test('scales at known points', () => {
  const t = scales.thermalCelsius;
  for (const [v, c] of [[2, 30], [5, 40], [9, 50], [13, 60], [19, 70], [28, 80], [39, 90], [54, 100]]) assert.equal(t(v), c);
  assert.equal(t(7), 45);
  assert.ok(t(60) > 100);
  assert.equal(scales.thermalFieldForCelsius(50), 9);
  assert.equal(scales.thermalFieldForCelsius(-50), 1);
  assert.equal(scales.thermalFieldForCelsius(500), 60);
  assert.equal(scales.celsiusToFahrenheit(100), 212);
  assert.equal(scales.timeoutSeconds(63), 2);
  assert.equal(scales.timeoutSeconds(3), 0.1);
  assert.equal(scales.limitLevel(27), 28);
  assert.ok(Math.abs(scales.bounceSensitivity(179) - 85) < 0.01);
  assert.equal(scales.pinField([2, 2, 2]), 73);
});

test('levels and descriptions', () => {
  assert.equal(LEVELS.length, 32);
  assert.deepEqual(LEVELS[0], { level: 1, percent: 0.005, power: '1.5 mW' });
  assert.equal(describeMode({ type: 'level', level: 21 }), 'Level 21 · 10 % · 3 W');
  assert.equal(describeMode({ type: 'afterburning' }), 'Afterburning · 100 % · 30 W');
  assert.equal(describeMode({ type: 'moonlight' }), 'Red moonlight');
  assert.equal(describeMode(signal('white', true, 64, 1000)), 'Custom signal · white · double · 64 ms on · 1 s off');
});

test('validateConfig: errors', () => {
  const bad = withConfig((c) => { c.single.modes[2] = signal('red', false, 250, 32); c.pin = { action: 'set', digits: [4, 8, 8] }; });
  const issues = validateConfig(bad);
  assert.deepEqual(issues.filter((i) => i.severity === 'error').map((i) => [i.code, i.path]),
    [['unsupported-signal', 'single.modes.2'], ['invalid-pin', 'pin']]);
  assert.equal(validateConfig(withConfig((c) => { c.pin = { action: 'keep', digits: [4, 8, 8] }; })).length, 0);
});

test('validateConfig: CR123A warnings', () => {
  const cr = (patch) => validateConfig(withConfig((c) => { c.dual.enabled = true; c.dual.cells = 'cr123a'; patch(c); }));
  assert.deepEqual(codes(cr(() => {})), ['cr123a-output-limit']); // default dual mode 4 is afterburning
  assert.deepEqual(codes(cr((c) => { c.dual.modes[3] = { type: 'level', level: 25 }; })), []);
  assert.deepEqual(codes(cr((c) => { c.dual.modes[3] = { type: 'level', level: 26 }; })), ['cr123a-output-limit']);
  assert.deepEqual(codes(cr((c) => { c.dual.modes[3] = { type: 'sos' }; c.stretch = false; })), ['cr123a-sos-strobe-stretch']);
  assert.deepEqual(codes(cr((c) => { c.dual.modes[3] = { type: 'strobe' }; })), []);
  assert.deepEqual(codes(cr((c) => { c.dual.modes[3] = signal('white', false, 64, 250); c.stretch = false; })), ['cr123a-signal-stretch']);
  assert.deepEqual(codes(cr((c) => { c.dual.modes[3] = signal('white', false, 64, 1000); c.stretch = false; })), []);
  const li = validateConfig(withConfig((c) => { c.dual.enabled = true; }));
  assert.deepEqual(li, []);
});

test('validateConfig: other warnings and info', () => {
  assert.deepEqual(codes(validateConfig(withConfig((c) => { c.thermal = { action: 'none', value: 13 }; }))), ['no-thermal-limit']);
  assert.deepEqual(codes(validateConfig(withConfig((c) => { c.protection = false; }))), ['protection-off']);
  assert.deepEqual(codes(validateConfig(withConfig((c) => { c.single.enabled = false; }))), ['modes-unchanged']);
  const kept = validateConfig(withConfig((c) => { c.memory = 'none'; c.protection = false; c.stretch = false; }));
  assert.deepEqual(codes(kept), ['protection-off', 'options-kept']);
  const crOnly = validateConfig(withConfig((c) => { c.memory = 'none'; c.protection = false; c.stretch = false; c.dual.enabled = true; c.dual.cells = 'cr123a'; }));
  assert.ok(!codes(crOnly).includes('options-kept'));
  assert.ok(validateConfig(defaultConfig()).every((i) => i.message.length > 0 && i.path));
});

test('defaultConfig matches the docs and encodes without errors', () => {
  const c = defaultConfig();
  assert.deepEqual(c.single.modes.map(modeCode), [36, 44, 51, 58]);
  assert.deepEqual(c.dual.modes.map(modeCode), [36, 44, 51, 63]);
  assert.deepEqual([c.bounce.value, c.switchTimeout.value, c.thermal.value, c.singleLimit.value, c.dualLimit.value], [179, 16, 13, 27, 31]);
  const p = buildProgram(c);
  assert.deepEqual(p.issues, []);
  assert.equal(p.fields[8], 29);
  // Worked by hand: 1944 cs of pulses and gaps, 154 frames, (2 * 189 + 29) mod 255 = 152.
  assert.equal(p.durationMs, 19440);
  assert.equal(p.frames.length, 154);
  assert.equal(p.checksum, 152);
  assert.equal(p.gif[0], 0x47);
  assert.notEqual(defaultConfig(), defaultConfig());
  assert.notEqual(defaultConfig().single.modes[0], defaultConfig().single.modes[0]);
});

test('buildProgram still builds with errors', () => {
  const p = buildProgram(withConfig((c) => { c.single.modes[0] = signal('red', false, 250, 32); }));
  assert.equal(p.fields[0], 63);
  assert.equal(p.issues[0].code, 'unsupported-signal');
});

test('normalizeConfig: garbage and partial input', () => {
  for (const bad of [null, undefined, 5, 'x', [], true]) assert.throws(() => normalizeConfig(bad), ConfigError);
  assert.deepEqual(normalizeConfig({}), defaultConfig());
  assert.deepEqual(normalizeConfig(defaultConfig()), defaultConfig());
  const n = normalizeConfig({
    single: { enabled: 'yes', modes: [null, { type: 'level', level: 99 }, null, 'junk'] },
    dual: { enabled: true, cells: 'aa', modes: [{ type: 'signal', color: 'blue' }] },
    memory: 'weird', protection: 1,
    bounce: { action: 'set', value: 9999 },
    switchTimeout: { action: 'off', value: -3 },
    thermal: { action: 'none', value: 'abc' },
    singleLimit: { action: 'set', value: 12.6 },
    dualLimit: { action: 'set', value: 0 },
    pin: { action: 'set', digits: [9, 0, 'x'] },
  });
  const d = defaultConfig();
  assert.equal(n.single.enabled, true);
  assert.deepEqual(n.single.modes, [d.single.modes[0], d.single.modes[1], null, d.single.modes[3]]);
  assert.equal(n.dual.enabled, true);
  assert.equal(n.dual.cells, 'li-ion');
  assert.deepEqual(n.dual.modes, d.dual.modes);
  assert.equal(n.memory, 'hybrid');
  assert.equal(n.protection, true);
  assert.deepEqual(n.bounce, { action: 'set', value: 254 });
  assert.deepEqual(n.switchTimeout, { action: 'keep', value: 1 });
  assert.deepEqual(n.thermal, { action: 'none', value: 13 });
  assert.deepEqual(n.singleLimit, { action: 'set', value: 13 });
  assert.deepEqual(n.dualLimit, { action: 'set', value: 1 });
  assert.deepEqual(n.pin, { action: 'set', digits: [4, 1, 2] });
});

test('normalizeConfig forces mode 1 non-null and survives a JSON round trip', () => {
  const n = normalizeConfig({ single: { modes: [null, null, null, null] } });
  assert.deepEqual(n.single.modes[0], { type: 'level', level: 6 });
  assert.deepEqual(n.single.modes.slice(1), [null, null, null]);
  const c = withConfig((x) => { x.single.modes[1] = signal('white', true, 64, 3000); x.pin = { action: 'set', digits: [3, 4, 5] }; });
  assert.deepEqual(normalizeConfig(JSON.parse(JSON.stringify(c))), c);
});

test('parseSource: bad input and edge cases', () => {
  assert.throws(() => parseSource('1,2,3'), ConfigError);
  assert.throws(() => parseSource(5), ConfigError);
  const ok = new Array(51).fill('0');
  ok[0] = '1S';
  const c = parseSource(ok.join(','));
  assert.deepEqual(c.single.modes[0], defaultConfig().single.modes[0]); // mode 1 "0" falls back to default
  assert.equal(c.single.modes[1], null);
  assert.deepEqual(c.bounce, defaultConfig().bounce); // "0" keeps default values
  const set = [...ok];
  set[17] = '2SP'; set[37] = '255'; set[41] = '127'; set[45] = '32'; set[34] = '8';
  const s = parseSource(set.join(','));
  assert.equal(s.dual.cells, 'cr123a');
  assert.equal(s.bounce.action, 'off');
  assert.equal(s.thermal.action, 'none');
  assert.equal(s.dualLimit.action, 'none');
  assert.equal(s.memory, 'standard');
  const sl = [...ok]; sl[45] = 'S'; sl[46] = '1'; sl[47] = 'S'; sl[48] = '3'; sl[49] = '7'; sl[50] = '7';
  const p = parseSource(sl.join(','));
  assert.deepEqual(p.dualLimit, { action: 'none', value: 31 });
  assert.deepEqual(p.pin, { action: 'set', digits: [4, 8, 8] });
});

test('normalizeConfig rejects string numbers and prototype names in enum-like fields', () => {
  const d = defaultConfig();
  const junk = ['250', '32', 'toString', 'constructor', '__proto__', 'hasOwnProperty', NaN, {}, []];
  for (const j of junk) {
    const c = normalizeConfig({
      single: { modes: [{ type: 'signal', color: 'red', double: false, onMs: j, offMs: 32 },
        { type: 'signal', color: 'red', double: false, onMs: 64, offMs: j },
        { type: 'signal', color: j, double: false, onMs: 64, offMs: 32 },
        { type: j }] },
      dual: { cells: j }, memory: j,
      bounce: { action: j, value: j }, thermal: { action: j }, pin: { action: j, digits: [j, j, j] },
    });
    assert.deepEqual(c, d, String(j));
    const p = buildProgram(c);
    assert.ok(p.fields.every((v) => v === null || Number.isInteger(v)));
  }
});

test('parseSource ignores prototype names in enum-like positions', () => {
  const v = new Array(51).fill('0');
  v[0] = '1S'; v[1] = 'S'; v[2] = '0'; v[3] = 'constructor'; v[4] = '24';
  v[34] = 'constructor'; v[37] = 'toString'; v[41] = '__proto__';
  const c = parseSource(v.join(','));
  const d = defaultConfig();
  assert.deepEqual(c.single.modes[0], d.single.modes[0]);
  assert.equal(c.memory, d.memory);
  assert.deepEqual(c.bounce, d.bounce);
  assert.deepEqual(c.thermal, d.thermal);
  assert.ok(buildProgram(c).fields.every((x) => x === null || Number.isInteger(x)));
});

test('unsupported signal: flagged in an enabled dual group, not in a disabled one', () => {
  const bad = signal('white', true, 250, 32);
  const on = validateConfig(withConfig((c) => { c.dual.enabled = true; c.dual.modes[1] = bad; }));
  assert.deepEqual(on.filter((i) => i.code === 'unsupported-signal').map((i) => i.path), ['dual.modes.1']);
  const off = validateConfig(withConfig((c) => { c.dual.modes[1] = bad; }));
  assert.deepEqual(codes(off), []);
});
