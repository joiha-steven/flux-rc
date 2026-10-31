// The guide translations (locales/guide/<code>.js) have exactly the shape of locales/guide/en.js: same keys (nested and arrays
// included), same {placeholders}, same array lengths, no empty text. A language in LANGUAGES without a file fails on purpose:
// the page for it cannot be built until the translation exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import en from '../locales/guide/en.js';
import { LANGUAGES } from '../src/ui/i18n.js';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'locales', 'guide');
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();

/** Problems of `value` against the shape of `base`, each prefixed with its key path. */
export function compare(base, value, path = '') {
  const problems = [];
  if (typeof base === 'string') {
    if (typeof value !== 'string') return [`${path}: expected text`];
    if (!value.trim()) problems.push(`${path}: empty`);
    if (placeholders(value) !== placeholders(base)) problems.push(`${path}: placeholders {${placeholders(value)}} differ from en {${placeholders(base)}}`);
  } else if (Array.isArray(base)) {
    if (!Array.isArray(value)) return [`${path}: expected a list`];
    if (value.length !== base.length) problems.push(`${path}: ${value.length} items, en has ${base.length}`);
    base.forEach((item, i) => problems.push(...compare(item, value[i], `${path}[${i}]`)));
  } else {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return [`${path}: expected a group`];
    for (const key of Object.keys(base)) {
      if (!Object.hasOwn(value, key)) problems.push(`${path}${key}: missing`);
      else problems.push(...compare(base[key], value[key], `${path}${key}${typeof base[key] === 'object' ? '.' : ''}`));
    }
    for (const key of Object.keys(value)) if (!Object.hasOwn(base, key)) problems.push(`${path}${key}: not in en`);
  }
  return problems;
}

test('the comparison catches missing, extra and changed keys, placeholders, list lengths and empty text', () => {
  const base = { a: 'x {n}', list: ['p', 'q'], group: { b: 'y' } };
  assert.deepEqual(compare(base, { a: 'z {n}', list: ['p', 'q'], group: { b: 'w' } }), []);
  assert.equal(compare(base, { a: 'z', list: ['p', 'q'], group: { b: 'w' } }).length, 1);
  assert.equal(compare(base, { a: 'z {n}', list: ['p'], group: { b: 'w' } }).length, 2);
  assert.deepEqual(compare(base, { a: 'z {n}', list: ['p', 'q'], group: { b: ' ' } }), ['group.b: empty']);
  assert.deepEqual(compare(base, { a: 'z {n}', list: ['p', 'q'], group: {}, c: 'e' }), ['group.b: missing', 'c: not in en']);
});

test('every language in LANGUAGES has a guide file', () => {
  const missing = LANGUAGES.filter((l) => !existsSync(join(dir, `${l.code}.js`))).map((l) => `locales/guide/${l.code}.js`);
  assert.deepEqual(missing, []);
});

for (const language of LANGUAGES.filter((l) => l.code !== 'en')) {
  const path = join(dir, `${language.code}.js`);
  if (!existsSync(path)) continue; // reported by the test above
  test(`locales/guide/${language.code}.js has the keys, placeholders and list lengths of en.js and no empty text`, async () => {
    const locale = (await import(pathToFileURL(path).href)).default;
    assert.deepEqual(compare(en, locale), []);
  });
}
