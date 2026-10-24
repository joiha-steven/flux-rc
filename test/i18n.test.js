// User-visible text lives in locales/. These tests keep the keys, the code, index.html and other
// locales in step with locales/en.js, and check t()'s fallback rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import en from '../locales/en.js';
import { createTranslator, t as pageT, LANGUAGES } from '../src/ui/i18n.js';
import { modeLabel } from '../src/ui/mode-text.js';
import { ENTRIES } from '../src/ui/modes-list.js';
import { PRESETS } from '../src/data/presets.js';
import { QUICK_PRESETS } from '../src/data/quick-presets.js';
import { describeMode, FIELD_IDS, FIELD_NAMES, validateConfig, defaultConfig } from '../src/core/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(join(root, file), 'utf8');
const collapse = (s) => s.replace(/\s+/g, ' ').trim();
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

function sourceFiles(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(join(root, path)).isDirectory()) return sourceFiles(path);
    return name.endsWith('.js') ? [path] : [];
  });
}
const sources = ['src/ui', 'src/data'].flatMap(sourceFiles).map((file) => ({ file, text: read(file) }));

/** Issue codes and English messages as written in core's validate.js. */
const coreIssues = [...read('src/core/validate.js').matchAll(/issue\('(\w+)',\s*'([\w-]+)',\s*'([^']+)'/g)]
  .map(([, severity, code, message]) => ({ severity, code, message }));

test('en has only string values and dotted keys', () => {
  for (const [key, value] of Object.entries(en)) {
    assert.match(key, /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9-]+)+$/, key);
    assert.equal(typeof value, 'string', key);
    assert.ok(value.length > 0, key);
  }
});

test('every literal key used under src/ exists in locales/en.js', () => {
  // Any quoted string that looks like a key from one of en's areas is treated as a key, which
  // covers t('a'), t(x ? 'a' : 'b') and keys kept in constants (STEP_KEYS, NOTICE_*).
  const areas = new Set(Object.keys(en).map((k) => k.split('.')[0]));
  const missing = [];
  let count = 0;
  for (const { file, text } of sources) {
    for (const [, key] of text.matchAll(/'([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9-]+)+)'/g)) {
      if (!areas.has(key.split('.')[0])) continue;
      count += 1;
      if (!Object.hasOwn(en, key)) missing.push(`${file}: ${key}`);
    }
  }
  assert.ok(count > 100, `found ${count} literal keys`);
  assert.deepEqual(missing, []);
});

test('every computed key used under src/ exists in locales/en.js for all its values', () => {
  const each = (values, fn) => values.map(fn);
  const modeTypes = ['afterburning', 'moonlight', 'sos', 'strobe', 'beacon', 'signal'];
  // Template source as written in the code -> every key it can produce.
  const COMPUTED = {
    'issue.${issue.code}': [...coreIssues.map((i) => `issue.${i.code}`), 'issue.internal'],
    'issue.severity.${RANK[issue.severity] ? issue.severity : \'info\'}': each(['error', 'warning', 'info'], (s) => `issue.severity.${s}`),
    'mode.color.${m.color}': ['mode.color.red', 'mode.color.white'],
    'mode.color.${mode.color}': ['mode.color.red', 'mode.color.white'],
    'mode.code.${mode.type}': each(modeTypes, (s) => `mode.code.${s}`),
    'mode.${mode.type}': each(modeTypes, (s) => `mode.${s}`),
    'mode.detail.${mode.type}': each(['moonlight', 'sos', 'strobe', 'beacon', 'signal'], (s) => `mode.detail.${s}`),
    'groups.${key}.title': ['groups.single.title', 'groups.dual.title'],
    'groups.${key}.use': ['groups.single.use', 'groups.dual.use'],
    'groups.${key}.note': ['groups.single.note', 'groups.dual.note'],
    'groups.${key}.offCopies': ['groups.single.offCopies', 'groups.dual.offCopies'],
    'picker.title.${key}': ['picker.title.single', 'picker.title.dual'],
    'behaviour.${area}.${value}': ['none', 'standard', 'hybrid'].map((v) => `behaviour.memory.${v}`).concat(['keep', 'off', 'set'].map((v) => `behaviour.bounce.${v}`)),
    'behaviour.${area}.${value}.desc': ['none', 'standard', 'hybrid'].map((v) => `behaviour.memory.${v}.desc`).concat(['keep', 'off', 'set'].map((v) => `behaviour.bounce.${v}.desc`)),
    'behaviour.${area}.on.desc': ['behaviour.protection.on.desc', 'behaviour.stretch.on.desc'],
    'behaviour.${area}.off.desc': ['behaviour.protection.off.desc', 'behaviour.stretch.off.desc'],
    'field.${FIELD_IDS[i]}': FIELD_IDS.map((id) => `field.${id}`),
    'program.switch.${type}.${part}': ['mcclicky', 'moff'].flatMap((s) => ['name', 'desc', 'rest', 'action', 'verb', 'final', 'hold', 'holdLabel'].map((p) => `program.switch.${s}.${p}`)),
    'program.tailcap.step${n}': [1, 2, 3, 4].map((n) => `program.tailcap.step${n}`),
    'program.stillRed.${tip}': each(['brightness', 'closer', 'darker', 'second'], (s) => `program.stillRed.${s}`),
    'vendorPreset.${preset.id}.name': PRESETS.map((p) => `vendorPreset.${p.id}.name`),
    'vendorPreset.${preset.id}.description': PRESETS.map((p) => `vendorPreset.${p.id}.description`),
    'quickPreset.${preset.id}.name': QUICK_PRESETS.map((p) => `quickPreset.${p.id}.name`),
    'quickPreset.${preset.id}.description': QUICK_PRESETS.map((p) => `quickPreset.${p.id}.description`),
  };
  const found = new Set();
  for (const { file, text } of sources) {
    for (const [, template] of text.matchAll(/\b(?:t|tParts|has)\(\s*`([^`]*)`/g)) {
      assert.ok(Object.hasOwn(COMPUTED, template), `${file}: computed key \`${template}\` is not listed in this test; add it with all its values`);
      found.add(template);
    }
  }
  assert.ok(found.size >= 20, `found ${found.size} computed keys`);
  for (const template of found) for (const key of COMPUTED[template]) assert.ok(Object.hasOwn(en, key), `${template} -> ${key}`);
});

/** Problems of one locale against en: keys en lacks, and placeholders that differ. */
function localeProblems(base, other) {
  const problems = [];
  for (const [key, value] of Object.entries(other)) {
    if (!Object.hasOwn(base, key)) { problems.push(`unknown key ${key}`); continue; }
    if (typeof value !== 'string') { problems.push(`${key} is not a string`); continue; }
    if (placeholders(value).join() !== placeholders(base[key]).join()) problems.push(`${key} placeholders {${placeholders(value)}} differ from en {${placeholders(base[key])}}`);
  }
  return problems;
}

test('every other locale has only en keys, with the same placeholders', async () => {
  const files = readdirSync(join(root, 'locales')).filter((f) => f.endsWith('.js') && f !== 'en.js');
  for (const file of files) {
    const other = (await import(pathToFileURL(join(root, 'locales', file)))).default;
    assert.deepEqual(localeProblems(en, other), [], file);
    assert.ok(LANGUAGES.some((l) => `${l.code}.js` === file), `${file} is in LANGUAGES in src/ui/i18n.js`);
  }
});

test('the locale check catches unknown keys and changed placeholders', () => {
  const good = { 'toast.loadedName': 'Đã tải “{name}”.', 'common.undo': 'Hoàn tác' };
  assert.deepEqual(localeProblems(en, good), []);
  const bad = { 'toast.loadedName': 'Đã tải “{ten}”.', 'common.undoo': 'Hoàn tác', 'unit.ms': '{n} ms {n}x' };
  assert.deepEqual(localeProblems(en, bad), [
    'toast.loadedName placeholders {ten} differ from en {name}',
    'unknown key common.undoo',
    'unit.ms placeholders {n,n} differ from en {n}',
  ]);
});

test('index.html data-i18n text and data-i18n-attr values exist in en and match it', () => {
  const html = read('index.html');
  let checked = 0;
  for (const [, tag, attrs, inner] of html.matchAll(/<(\w+)([^>]*\sdata-i18n="[^"]+"[^>]*)>([\s\S]*?)<\/\1>/g)) {
    const key = attrs.match(/\sdata-i18n="([^"]+)"/)[1];
    assert.ok(Object.hasOwn(en, key), `<${tag} data-i18n="${key}"> has a key in en`);
    const text = inner.replace(/<a\b[^>]*data-i18n-slot="(\w+)"[^>]*>[\s\S]*?<\/a>/g, '{$1}').replace(/<[^>]+>/g, '');
    assert.equal(collapse(text), en[key], `<${tag} data-i18n="${key}"> text`);
    checked += 1;
  }
  for (const [tagText] of html.matchAll(/<\w+[^>]*\sdata-i18n-attr="[^"]+"[^>]*>/g)) {
    for (const pair of tagText.match(/data-i18n-attr="([^"]+)"/)[1].split(';')) {
      const [attr, key] = pair.split(':');
      assert.ok(Object.hasOwn(en, key), `${attr}:${key} has a key in en`);
      const value = tagText.match(new RegExp(`\\s${attr}="([^"]*)"`));
      assert.ok(value, `${tagText} has a ${attr} attribute`);
      assert.equal(value[1], en[key], `${attr}:${key}`);
      checked += 1;
    }
  }
  assert.ok(checked >= 15, `checked ${checked} strings`);
});

test('the boot guard and <noscript> (plain inline HTML, English only) match en', () => {
  const html = read('index.html');
  const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)[1].replace(/<[^>]+>/g, '');
  assert.equal(collapse(noscript), en['boot.noscript']);
  assert.match(html, /i18n key: boot\.noscript/);
  const guard = html.match(/<!-- Boot guard:[\s\S]*?<script>([\s\S]*?)<\/script>/);
  assert.ok(guard, 'boot guard script found');
  assert.match(guard[0], /i18n keys: boot\.failed, boot\.reload/);
  for (const key of ['boot.failed', 'boot.reload']) assert.ok(guard[1].includes(`textContent = ${JSON.stringify(en[key])}`), key);
});

test('t(): current locale, then en, then the key itself (warned once); params are filled', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const tr = createTranslator({ en: { a: 'A {x}', b: 'B {x} {y}' }, xx: { a: 'XA {x}' } }, 'xx');
  assert.equal(tr.t('a', { x: 1 }), 'XA 1');
  assert.equal(tr.t('b', { x: 'one', y: 2 }), 'B one 2');
  assert.equal(tr.t('b', { x: 'one' }), 'B one {y}');
  assert.equal(tr.t('missing.key'), 'missing.key');
  assert.equal(tr.t('missing.key'), 'missing.key');
  assert.equal(warn.mock.callCount(), 1);
  assert.equal(tr.has('b'), true);
  assert.equal(tr.has('missing.key'), false);
  const node = { node: true };
  assert.deepEqual(tr.tParts('b', { x: node, y: 'Y' }), ['B ', node, ' ', 'Y']);
  assert.equal(pageT('toast.loadedName', { name: 'X' }), 'Loaded “X”.');
});

test('modeLabel (UI, from the locale) equals core describeMode for every mode', () => {
  const signals = [];
  for (const color of ['red', 'white']) for (const double of [false, true]) for (const onMs of [64, 250]) for (const offMs of [32, 250, 1000, 3000]) {
    signals.push({ type: 'signal', color, double, onMs, offMs });
  }
  const modes = [...ENTRIES.filter(Boolean), ...signals];
  assert.equal(modes.length, 38 + 32);
  for (const mode of modes) assert.equal(modeLabel(mode), describeMode(mode), JSON.stringify(mode));
});

test('core issue messages and field names equal their en text', () => {
  assert.ok(coreIssues.length >= 9, `found ${coreIssues.length} issues in validate.js`);
  for (const { code, message } of coreIssues) assert.equal(en[`issue.${code}`], message, code);
  const c = defaultConfig();
  c.thermal = { action: 'none', value: 13 };
  c.protection = false;
  for (const issue of validateConfig(c)) assert.equal(en[`issue.${issue.code}`], issue.message);
  assert.equal(FIELD_IDS.length, FIELD_NAMES.length);
  FIELD_IDS.forEach((id, i) => assert.equal(en[`field.${id}`], FIELD_NAMES[i], id));
});

test('presets read their name and description from the locale', () => {
  for (const p of [...PRESETS, ...QUICK_PRESETS]) {
    assert.ok(p.name && p.description, p.id);
    assert.ok(!/^(vendor|quick)Preset\./.test(p.name), `${p.id} has text, not a key`);
  }
  assert.equal(PRESETS.find((p) => p.id === 'oem-mark').name, 'OEM_Mark');
});
