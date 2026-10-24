// User-visible text. Every string lives in locales/<code>.js; code asks for it by key with t().
// English (locales/en.js) is the source of truth and the fallback for keys a locale lacks.
// See locales/README.md for adding a language.
import en from '../../locales/en.js';

/** Registry of bundled locales. Adding a language: import locales/<code>.js and add it here. */
export const LOCALES = { en };
export const FALLBACK = 'en';

/**
 * The locale in use. Always English for now.
 * Picking goes here when a second locale exists: a stored choice first, then the first of
 * navigator.languages that is in LOCALES, then FALLBACK. Pick once, before anything renders.
 */
const current = FALLBACK;

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
