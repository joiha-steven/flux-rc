// Language choice: which locale is picked, that the language list matches locales/, and that only
// English is downloaded at startup (other locales load on demand with import()).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pickLanguage, LANGUAGES } from '../src/ui/i18n.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localeFiles = readdirSync(join(root, 'locales')).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''));

test('LANGUAGES lists exactly the locale files, in the agreed order, each with a name and short label', () => {
  assert.deepEqual(LANGUAGES.map((l) => l.code), ['en', 'vi', 'de', 'ja', 'zh-Hans']);
  assert.deepEqual(LANGUAGES.map((l) => l.code).sort(), [...localeFiles].sort());
  for (const l of LANGUAGES) assert.ok(l.name && l.short, l.code);
});

test('a stored known code wins over the browser languages', () => {
  assert.equal(pickLanguage('de', ['vi-VN']), 'de');
  assert.equal(pickLanguage('zh-Hans', ['en-US']), 'zh-Hans');
  assert.equal(pickLanguage('en', ['vi']), 'en');
});

test('a stored value that is not a known code is ignored', () => {
  for (const bad of ['fr', 'zh-Hant', 'DE', '', null, undefined, 'constructor']) assert.equal(pickLanguage(bad, ['ja-JP']), 'ja', String(bad));
});

test('browser languages match by primary subtag, first match wins', () => {
  assert.equal(pickLanguage(null, ['de-AT']), 'de');
  assert.equal(pickLanguage(null, ['vi-VN', 'en']), 'vi');
  assert.equal(pickLanguage(null, ['ja-JP']), 'ja');
  assert.equal(pickLanguage(null, ['fr-FR', 'de-DE', 'ja']), 'de');
  assert.equal(pickLanguage(null, ['en-US']), 'en');
});

test('Chinese: Simplified matches, Traditional is skipped', () => {
  for (const tag of ['zh', 'zh-CN', 'zh-SG', 'zh-Hans', 'zh-Hans-CN']) assert.equal(pickLanguage(null, [tag]), 'zh-Hans', tag);
  for (const tag of ['zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant', 'zh-Hant-TW']) assert.equal(pickLanguage(null, [tag]), 'en', tag);
  assert.equal(pickLanguage(null, ['zh-TW', 'ja']), 'ja');
});

test('falls back to English with no usable input', () => {
  assert.equal(pickLanguage(null, []), 'en');
  assert.equal(pickLanguage(null, undefined), 'en');
  assert.equal(pickLanguage(null, ['fr', 'es-MX', 'pt-BR']), 'en');
});

test('no locale other than en is statically imported or modulepreloaded', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const preloaded = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="locales\/([^"]+)\.js"/g)].map((m) => m[1]);
  assert.deepEqual(preloaded, ['en']);
  const sources = ['src/ui', 'src/data', 'src/core'].flatMap((dir) => readdirSync(join(root, dir), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => join(dir, f)));
  for (const file of sources) {
    const text = readFileSync(join(root, file), 'utf8');
    for (const code of localeFiles.filter((c) => c !== 'en')) {
      assert.ok(!new RegExp(`^\\s*import[^\\n]*locales/${code}\\.js`, 'm').test(text), `${file} must not statically import locales/${code}.js`);
    }
  }
});
