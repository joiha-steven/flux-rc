// Language choice: which locale is picked, that the language list matches locales/, and that only
// English is downloaded at startup (other locales load on demand with import()).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pickLanguage, languagePath, guidePath, LANGUAGES, LANG_KEY } from '../src/ui/i18n.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localeFiles = readdirSync(join(root, 'locales')).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''));

test('LANGUAGES lists exactly the locale files, in the agreed order, each with a name and short label', () => {
  assert.deepEqual(LANGUAGES.map((l) => l.code), ['en', 'vi', 'de', 'ja', 'zh-Hans', 'zh-Hant', 'ru', 'ko', 'es']);
  assert.deepEqual(LANGUAGES.map((l) => l.code).sort(), [...localeFiles].sort());
  for (const l of LANGUAGES) assert.ok(l.name && l.short, l.code);
});

test('a stored known code wins over the browser languages', () => {
  assert.equal(pickLanguage('de', ['vi-VN']), 'de');
  assert.equal(pickLanguage('zh-Hans', ['en-US']), 'zh-Hans');
  assert.equal(pickLanguage('en', ['vi']), 'en');
});

test('a stored value that is not a known code is ignored', () => {
  for (const bad of ['fr', 'DE', '', null, undefined, 'constructor']) assert.equal(pickLanguage(bad, ['ja-JP']), 'ja', String(bad));
});

test('browser languages match by primary subtag, first match wins', () => {
  assert.equal(pickLanguage(null, ['de-AT']), 'de');
  assert.equal(pickLanguage(null, ['vi-VN', 'en']), 'vi');
  assert.equal(pickLanguage(null, ['ja-JP']), 'ja');
  assert.equal(pickLanguage(null, ['fr-FR', 'de-DE', 'ja']), 'de');
  assert.equal(pickLanguage(null, ['en-US']), 'en');
});

test('Russian, Korean and Spanish match any regional tag', () => {
  for (const tag of ['ru', 'ru-RU', 'ru-UA']) assert.equal(pickLanguage(null, [tag]), 'ru', tag);
  for (const tag of ['ko', 'ko-KR', 'ko-KP']) assert.equal(pickLanguage(null, [tag]), 'ko', tag);
  for (const tag of ['es', 'es-ES', 'es-MX', 'es-419', 'es-AR']) assert.equal(pickLanguage(null, [tag]), 'es', tag);
  assert.equal(pickLanguage('zh-Hant', []), 'zh-Hant');
});

test('Chinese: Traditional (Hant, TW, HK, MO) is zh-Hant, the rest is Simplified', () => {
  for (const tag of ['zh', 'zh-CN', 'zh-SG', 'zh-Hans', 'zh-Hans-CN']) assert.equal(pickLanguage(null, [tag]), 'zh-Hans', tag);
  for (const tag of ['zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK']) assert.equal(pickLanguage(null, [tag]), 'zh-Hant', tag);
  assert.equal(pickLanguage(null, ['zh-Hans-TW']), 'zh-Hans');
  assert.equal(pickLanguage(null, ['zh-TW', 'ja']), 'zh-Hant');
});

test('falls back to English with no usable input', () => {
  assert.equal(pickLanguage(null, []), 'en');
  assert.equal(pickLanguage(null, undefined), 'en');
  assert.equal(pickLanguage(null, ['fr', 'pt-BR', 'it']), 'en');
});

test('each language has its own URL folder; English is the root', () => {
  assert.deepEqual(LANGUAGES.map((l) => languagePath(l.code)), ['/', '/vi/', '/de/', '/ja/', '/zh/', '/zh-hant/', '/ru/', '/ko/', '/es/']);
  assert.equal(languagePath('nope'), '/');
});

// The inline script at the top of index.html repeats pickLanguage(); run it against the real rule.
function runRedirect({ pathname = '/', stored, languages, storageThrows = false, search = '', hash = '', page = 'index.html' }) {
  const html = readFileSync(join(root, page), 'utf8');
  const script = html.match(/<!-- Language redirect[\s\S]*?<script>([\s\S]*?)<\/script>/)[1];
  let target = null;
  const location = { pathname, search, hash, replace: (url) => { target = url; } };
  const localStorage = { getItem: (key) => {
    assert.equal(key, LANG_KEY);
    if (storageThrows) throw new Error('blocked');
    return stored ?? null;
  } };
  new Function('location', 'localStorage', 'navigator', script)(location, localStorage, { languages });
  return target;
}

test('the redirect on "/" sends each visitor where pickLanguage() says, and keeps ?query and #hash', () => {
  const stores = [undefined, 'en', 'vi', 'de', 'ja', 'zh-Hans', 'zh-Hant', 'ru', 'ko', 'es', 'fr', 'constructor', ''];
  const browsers = [[], ['en-US'], ['vi-VN', 'en'], ['de-AT'], ['ja-JP'], ['zh-CN'], ['zh-Hans-CN'], ['zh-TW'], ['zh-HK', 'ja'], ['zh-Hant-TW'], ['ru-RU'], ['ko-KR'], ['es-MX'], ['es-419', 'de'], ['pt-BR', 'it'], ['fr', 'de']];
  for (const stored of stores) for (const languages of browsers) {
    const code = pickLanguage(stored ?? null, languages);
    const expected = code === 'en' ? null : languagePath(code);
    assert.equal(runRedirect({ stored, languages }), expected, `${stored} ${languages}`);
  }
  assert.equal(runRedirect({ languages: ['vi'], search: '?a=1', hash: '#c=abc' }), '/vi/?a=1#c=abc');
  assert.equal(runRedirect({ stored: 'en', languages: ['vi'], hash: '#c=abc' }), null);
});

test('the redirect survives a blocked localStorage and does nothing off the root', () => {
  assert.equal(runRedirect({ storageThrows: true, languages: ['ja'] }), '/ja/');
  assert.equal(runRedirect({ storageThrows: true, languages: ['en'] }), null);
  assert.equal(runRedirect({ pathname: '/de/', stored: 'vi', languages: ['ja'] }), null);
});

test('no locale other than en is statically imported or modulepreloaded', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const preloaded = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="\/locales\/([^"]+)\.js"/g)].map((m) => m[1]);
  assert.deepEqual(preloaded, ['en']);
  const sources = ['src/ui', 'src/data', 'src/core'].flatMap((dir) => readdirSync(join(root, dir), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => join(dir, f)));
  for (const file of sources) {
    const text = readFileSync(join(root, file), 'utf8');
    for (const code of localeFiles.filter((c) => c !== 'en')) {
      assert.ok(!new RegExp(`^\\s*import[^\\n]*locales/${code}\\.js`, 'm').test(text), `${file} must not statically import locales/${code}.js`);
    }
  }
});

test('each language has a guide URL next to its page; English is /guide/', () => {
  assert.deepEqual(LANGUAGES.map((l) => guidePath(l.code)), ['/guide/', '/vi/guide/', '/de/guide/', '/ja/guide/', '/zh/guide/', '/zh-hant/guide/', '/ru/guide/', '/ko/guide/', '/es/guide/']);
  assert.equal(guidePath('nope'), '/guide/');
});

test('the redirect on "/guide/" sends each visitor to the guide of the language pickLanguage() says, and keeps ?query and #hash', () => {
  const stores = [undefined, 'en', 'vi', 'de', 'ja', 'zh-Hans', 'zh-Hant', 'ru', 'ko', 'es', 'fr', 'constructor', ''];
  const browsers = [[], ['en-US'], ['vi-VN', 'en'], ['de-AT'], ['ja-JP'], ['zh-CN'], ['zh-TW'], ['zh-HK', 'ja'], ['zh-Hant-TW'], ['ru-RU'], ['ko-KR'], ['es-419', 'de'], ['pt-BR', 'it'], ['fr', 'de']];
  const guide = (options) => runRedirect({ ...options, pathname: '/guide/', page: 'guide/index.html' });
  for (const stored of stores) for (const languages of browsers) {
    const code = pickLanguage(stored ?? null, languages);
    assert.equal(guide({ stored, languages }), code === 'en' ? null : guidePath(code), `${stored} ${languages}`);
  }
  assert.equal(guide({ languages: ['vi'], search: '?a=1', hash: '#pin-112' }), '/vi/guide/?a=1#pin-112');
  assert.equal(guide({ stored: 'en', languages: ['vi'] }), null);
  assert.equal(guide({ storageThrows: true, languages: ['ja'] }), '/ja/guide/');
  assert.equal(runRedirect({ pathname: '/vi/guide/', stored: 'de', languages: ['ja'], page: 'guide/index.html' }), null);
});
