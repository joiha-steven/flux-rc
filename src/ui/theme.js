// Light / dark theme choice. "auto" follows the device; "light" and "dark" force one via <html data-theme>.
// The inline script in index.html reads the same storage key before first paint, so keep the two in sync.
import { icon } from './icons.js';
import { t } from './i18n.js';

export const THEME_KEY = 'flux-rc:theme';
const ORDER = ['auto', 'light', 'dark'];

// Page background per resolved scheme; keep equal to --bg in styles/tokens.css and the theme-color metas in index.html.
const THEME_BG = { light: '#f6f4f0', dark: '#0b0c0e' };
const ICON = { auto: 'themeAuto', light: 'sun', dark: 'moon' };

/** Anything other than "light" or "dark" (missing, damaged, hand-edited) means auto. */
export function parseTheme(raw) {
  return raw === 'light' || raw === 'dark' ? raw : 'auto';
}

/** Auto -> light -> dark -> auto. */
export function nextTheme(choice) {
  return ORDER[(ORDER.indexOf(parseTheme(choice)) + 1) % ORDER.length];
}

/** The scheme actually shown: a forced choice wins, otherwise the device preference. */
export function resolveTheme(choice, prefersDark) {
  const parsed = parseTheme(choice);
  return parsed === 'auto' ? (prefersDark ? 'dark' : 'light') : parsed;
}

/** Screen-reader label and tooltip: current state and what a click does. */
export function themeLabel(choice) {
  const current = parseTheme(choice);
  return t('theme.label', { current: t(`theme.current.${current}`), next: t(`theme.next.${nextTheme(current)}`) });
}

/** Colour for the browser bar: the resolved theme's page background. */
export function themeColor(choice, prefersDark) {
  return THEME_BG[resolveTheme(choice, prefersDark)];
}

/** Browsers without light-dark() only get the dark palette, so there is nothing to switch. */
export function themeSupported() {
  try {
    return typeof CSS !== 'undefined' && CSS.supports('color', 'light-dark(red, red)');
  } catch {
    return false;
  }
}

export function loadTheme() {
  try {
    return parseTheme(localStorage.getItem(THEME_KEY));
  } catch (error) {
    console.warn('flux-rc: could not read the theme choice', error);
    return 'auto';
  }
}

function saveTheme(choice) {
  try {
    if (choice === 'auto') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch (error) {
    console.warn('flux-rc: could not save the theme choice', error);
  }
}

function applyTheme(choice) {
  const root = document.documentElement;
  if (choice === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
}

/** Forced theme: one theme-color for every meta. Auto: back to the light/dark media pair from index.html. */
function applyThemeColor(choice) {
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  metas.forEach((meta) => {
    if (meta.dataset.media === undefined) meta.dataset.media = meta.getAttribute('media') || '';
    if (choice === 'auto') {
      if (meta.dataset.media) meta.setAttribute('media', meta.dataset.media);
      meta.setAttribute('content', meta.dataset.content ?? meta.getAttribute('content'));
    } else {
      if (meta.dataset.content === undefined) meta.dataset.content = meta.getAttribute('content');
      meta.removeAttribute('media');
      meta.setAttribute('content', themeColor(choice, dark));
    }
  });
}

/** Wires the topbar button. The choice is kept in memory too, so it still cycles if storage fails. */
export function mountThemeToggle(button) {
  // Without light-dark() the page is always dark, so the browser bar should be too.
  if (!themeSupported()) { button.hidden = true; applyThemeColor('dark'); return; }
  let choice = loadTheme();
  const paint = () => {
    applyTheme(choice);
    applyThemeColor(choice);
    const label = themeLabel(choice);
    button.setAttribute('aria-label', label);
    button.title = label;
    button.querySelector('.icon')?.remove();
    button.prepend(icon(ICON[choice]));
  };
  button.addEventListener('click', () => {
    choice = nextTheme(choice);
    saveTheme(choice);
    paint();
  });
  paint();
}
