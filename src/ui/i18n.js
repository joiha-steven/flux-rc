// User-visible text. Every string lives in locales/<code>.js; code asks for it by key with t().
// English (locales/en.js) is the source of truth and the fallback for keys a locale lacks.
// See locales/README.md for adding a language.
import en from '../../locales/en.js';

export const FALLBACK = 'en';
/** localStorage key for the language choice. The inline script at the top of index.html reads the same key. */
export const LANG_KEY = 'flux-rc:lang';

/**
 * Supported languages in menu order. `name` is the language's own name and `short` the topbar
 * button label; `path` is the language's URL folder ('' for English at /). These are data, not UI text: each language is always shown in its own name, so
 * they are deliberately not in locales/. Each code has a file locales/<code>.js.
 */
export const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN', path: '' },
  { code: 'vi', name: 'Tiếng Việt', short: 'VI', path: 'vi' },
  { code: 'de', name: 'Deutsch', short: 'DE', path: 'de' },
  { code: 'ja', name: '日本語', short: '日本語', path: 'ja' },
  { code: 'zh-Hans', name: '简体中文', short: '简中', path: 'zh' },
  { code: 'zh-Hant', name: '繁體中文', short: '繁中', path: 'zh-hant' },
  { code: 'ru', name: 'Русский', short: 'RU', path: 'ru' },
  { code: 'ko', name: '한국어', short: '한국어', path: 'ko' },
  { code: 'es', name: 'Español', short: 'ES', path: 'es' },
];
const CODES = LANGUAGES.map((l) => l.code);

/** Maps one BCP 47 tag from navigator.languages to a supported code, or null. */
function matchTag(tag) {
  const parts = String(tag).toLowerCase().split('-');
  const primary = parts[0];
  if (primary === 'zh') {
    // Traditional (Hant, or TW / HK / MO without a script) is zh-Hant; everything else Chinese is Simplified.
    if (parts.includes('hant') || (!parts.includes('hans') && ['tw', 'hk', 'mo'].includes(parts[1]))) return 'zh-Hant';
    return 'zh-Hans';
  }
  return CODES.find((code) => code.toLowerCase() === primary) ?? null;
}

/**
 * The language "/" redirects to: a stored choice that is a known code, else the first of the
 * browser's languages that matches (by primary subtag), else English. Pure so it can be tested;
 * the inline script in index.html repeats this rule (test/language.test.js runs both).
 */
export function pickLanguage(stored, navigatorLanguages = []) {
  if (CODES.includes(stored)) return stored;
  for (const tag of navigatorLanguages ?? []) {
    const code = matchTag(tag);
    if (code) return code;
  }
  return FALLBACK;
}

/** The root-absolute URL path of a language's page: '/' for English, '/vi/' for Vietnamese. */
export function languagePath(code) {
  const language = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
  return language.path ? `/${language.path}/` : '/';
}

/**
 * Saves the choice and goes to that language's page, keeping the query and the #hash (share links).
 * English is stored too, so the root page stays English for someone who picked it.
 */
export function setLanguage(code) {
  if (!CODES.includes(code)) return;
  try {
    localStorage.setItem(LANG_KEY, code);
  } catch (error) {
    console.warn('flux-rc: could not save the language choice', error);
  }
  location.assign(languagePath(code) + location.search + location.hash);
}

// The page decides its language: each language has its own URL and its static HTML carries <html lang>.
// Storage and the browser's languages only matter on "/", where the inline script in index.html redirects.
// Only the chosen locale is downloaded; English is always bundled as the fallback.
// Outside a browser (the tests) there is no page, so it stays English.
const pageLang = typeof document === 'undefined' ? null : document.documentElement.lang;
let current = CODES.includes(pageLang) ? pageLang : FALLBACK;
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
