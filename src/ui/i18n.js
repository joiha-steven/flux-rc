// User-visible text. Every string lives in locales/<code>.js; code asks for it by key with t().
// English (locales/en.js) is the source of truth and the fallback for keys a locale lacks.
// See locales/README.md for adding a language.
import en from '../../locales/en.js';

export const FALLBACK = 'en';
export const LANG_KEY = 'flux-rc:lang';

/**
 * Supported languages in menu order. `name` is the language's own name and `short` the topbar
 * button label. These are data, not UI text: each language is always shown in its own name, so
 * they are deliberately not in locales/. Each code has a file locales/<code>.js.
 */
export const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'vi', name: 'Tiếng Việt', short: 'VI' },
  { code: 'de', name: 'Deutsch', short: 'DE' },
  { code: 'ja', name: '日本語', short: '日本語' },
  { code: 'zh-Hans', name: '简体中文', short: '中文' },
];
const CODES = LANGUAGES.map((l) => l.code);

/** Maps one BCP 47 tag from navigator.languages to a supported code, or null. */
function matchTag(tag) {
  const parts = String(tag).toLowerCase().split('-');
  const primary = parts[0];
  if (primary === 'zh') {
    // Only Simplified Chinese is supported; Traditional (TW, HK, MO, Hant) must not match.
    if (parts.includes('hant') || ['tw', 'hk', 'mo'].includes(parts[1])) return null;
    return 'zh-Hans';
  }
  return CODES.find((code) => code.toLowerCase() === primary) ?? null;
}

/**
 * The language to use: a stored choice that is a known code, else the first of the browser's
 * languages that matches (by primary subtag), else English. Pure so it can be tested.
 */
export function pickLanguage(stored, navigatorLanguages = []) {
  if (CODES.includes(stored)) return stored;
  for (const tag of navigatorLanguages ?? []) {
    const code = matchTag(tag);
    if (code) return code;
  }
  return FALLBACK;
}

function readStoredLanguage() {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch (error) {
    console.warn('flux-rc: could not read the language choice', error);
    return null;
  }
}

/** Saves the choice and reloads, so the whole page (including the static HTML) is rebuilt in it. */
export function setLanguage(code) {
  if (!CODES.includes(code)) return;
  try {
    localStorage.setItem(LANG_KEY, code);
  } catch (error) {
    console.warn('flux-rc: could not save the language choice', error);
  }
  location.reload();
}

// Only the chosen locale is downloaded; English is always bundled as the fallback.
// Outside a browser (the tests) there is no stored choice or navigator language, so it stays English.
let current = typeof document === 'undefined' ? FALLBACK : pickLanguage(readStoredLanguage(), navigator.languages);
/** Locales loaded so far (code -> strings). */
export const LOCALES = { en };
if (current !== FALLBACK) {
  try {
    LOCALES[current] = (await import(`../../locales/${current}.js`)).default;
  } catch (error) {
    console.warn(`flux-rc: could not load the "${current}" texts, using English`, error);
    current = FALLBACK;
  }
}

/** Fills {name} placeholders. Unknown placeholders stay as they are, so a mistake is visible. */
export function format(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name) => (Object.hasOwn(params, name) ? String(params[name]) : whole));
}

/**
 * A translator over `locales` (code -> strings) for locale `code`. Exported so tests can try
 * other locales; the page uses the module-level t() below.
 */
export function createTranslator(locales, code, fallback = FALLBACK) {
  const warned = new Set();
  const lookup = (key) => {
    const own = locales[code]?.[key];
    if (typeof own === 'string') return own;
    const base = locales[fallback]?.[key];
    return typeof base === 'string' ? base : null;
  };
  /** t('key', { name }) -> text. A key missing everywhere returns the key itself and warns once. */
  function t(key, params) {
    const text = lookup(key);
    if (text === null) {
      if (!warned.has(key)) { warned.add(key); console.warn(`flux-rc: missing text for "${key}"`); }
      return key;
    }
    return format(text, params);
  }
  /**
   * Like t(), but returns an array of pieces so params can be DOM nodes (a link, a <b>):
   * h('span', {}, tParts('footer.perLoop', { loop: h('b', {}, '7.9 s') })).
   */
  function tParts(key, params = {}) {
    return t(key).split(/\{(\w+)\}/).map((piece, i) => {
      if (i % 2 === 0) return piece;
      return Object.hasOwn(params, piece) ? params[piece] : `{${piece}}`;
    }).filter((piece) => piece !== '');
  }
  const has = (key) => lookup(key) !== null;
  return { t, tParts, has, locale: code };
}

const translator = createTranslator(LOCALES, current);
export const { t, tParts, has } = translator;
export const locale = () => current;

/**
 * Fills index.html elements marked with data-i18n="key" (text) and
 * data-i18n-attr="aria-label:key;title:key2" (attributes). When the text has {placeholders}, child
 * elements marked data-i18n-slot="name" are kept and put in their place (links in the About text).
 */
export function applyStatic(root = document) {
  document.documentElement.lang = current;
  for (const el of root.querySelectorAll('[data-i18n]')) {
    const text = t(el.getAttribute('data-i18n'));
    const slots = new Map([...el.children].filter((c) => c.hasAttribute('data-i18n-slot')).map((c) => [c.getAttribute('data-i18n-slot'), c]));
    if (slots.size) el.replaceChildren(...tParts(el.getAttribute('data-i18n'), Object.fromEntries(slots)));
    else el.textContent = text;
  }
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.getAttribute('data-i18n-attr').split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
}
