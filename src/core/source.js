// Parser for the original site's 51-value "source" string. See docs/protocol.md section 9.
import { ConfigError, DEFAULT_MODES, defaultConfig } from './config.js';
import { modeFromCode } from './modes.js';

const ON = { 4: 64, 0: 250 };
const OFF = { 0: 32, 8: 250, 16: 1000, 24: 3000 };

/** Parse one mode from four values; `slot` 0 can never be "not in use". */
function parseMode(v, slot, fallback) {
  const level = v[0];
  if (level === '0') return slot === 0 ? { ...fallback } : null;
  if (level === 'S') {
    const kind = Number(v[1]);
    if (!(kind >= 0 && kind <= 3) || !Object.hasOwn(ON, v[2]) || !Object.hasOwn(OFF, v[3])) return { ...fallback };
    return {
      type: 'signal', color: kind & 1 ? 'white' : 'red', double: Boolean(kind & 2),
      onMs: ON[v[2]], offMs: OFF[v[3]],
    };
  }
  return modeFromCode(/^\d+$/.test(level) ? Number(level) : NaN) || { ...fallback };
}

function parseGroup(values, start, defaults) {
  return defaults.map((fallback, i) => parseMode(values.slice(start + i * 4, start + i * 4 + 4), i, fallback));
}

/** Read a value of 1..max, or return null when it is not a usable number. */
function slider(token, max) {
  const n = /^\d+$/.test(token) ? Number(token) : NaN;
  return n >= 1 && n <= max ? n : null;
}

/** Apply a `[action, value]` pair to a setting. `fieldOf` maps the slider value to the raw field. */
function applySetting(target, tokens, sliderMax, fieldOf, specials) {
  const [action, raw] = tokens;
  if (Object.hasOwn(specials, action)) {
    target.action = specials[action];
  } else if (action === 'S') {
    const v = slider(raw, sliderMax);
    if (v !== null) {
      target.action = 'set';
      target.value = fieldOf(v);
    }
  }
}

/**
 * Parse an original source string into a config. Disabled groups still keep their parsed modes.
 * @param {string} source 51 comma-separated values
 * @returns {object}
 * @throws {ConfigError} if the string does not have 51 values
 */
export function parseSource(source) {
  if (typeof source !== 'string') throw new ConfigError('Source must be a string');
  const v = source.split(',').map((s) => s.trim());
  if (v.length !== 51) throw new ConfigError(`Source needs 51 values, got ${v.length}`);

  const config = defaultConfig();
  config.single.enabled = v[0] === '1S';
  config.single.modes = parseGroup(v, 1, DEFAULT_MODES.single);
  config.dual.enabled = v[17] === '2S' || v[17] === '2SP';
  config.dual.cells = v[17] === '2SP' ? 'cr123a' : 'li-ion';
  config.dual.modes = parseGroup(v, 18, DEFAULT_MODES.dual);

  const memory = { 0: 'none', 8: 'standard', 24: 'hybrid' };
  if (Object.hasOwn(memory, v[34])) config.memory = memory[v[34]];
  if (v[35] === '0' || v[35] === '1') config.protection = v[35] === '1';
  if (v[36] === '0' || v[36] === '4') config.stretch = v[36] === '4';

  applySetting(config.bounce, v.slice(37, 39), 254, (x) => 255 - x, { 255: 'off' });
  applySetting(config.switchTimeout, v.slice(39, 41), 63, (x) => 64 - x, {});
  applySetting(config.thermal, v.slice(41, 43), 60, (x) => 61 - x, { 127: 'none' });
  applySetting(config.singleLimit, v.slice(43, 45), 30, (x) => 31 - x, {});
  applySetting(config.dualLimit, v.slice(45, 47), 32, (x) => 33 - x, { 32: 'none' });
  if (config.dualLimit.value === 32) Object.assign(config.dualLimit, { action: 'none', value: 31 });
  if (v[47] === 'S') {
    config.pin.action = 'set';
    config.pin.digits = [v[48], v[49], v[50]].map((d, i) => {
      const n = /^\d+$/.test(d) ? Number(d) : 1;
      return Math.min(n, [3, 7, 7][i]) + 1;
    });
  }
  return config;
}
