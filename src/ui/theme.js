// Light / dark theme. The site is dark by default and ignores the device setting; the topbar button toggles
// light <-> dark via <html data-theme>. The inline script in index.html reads the same storage key before first paint, so keep the two in sync.
import { icon } from './icons.js';
import { t } from './i18n.js';

export const THEME_KEY = 'flux-rc:theme';

// Page background per theme; keep equal to --bg in styles/tokens.css and the theme-color meta in index.html.
const THEME_BG = { light: '#e6e3dc', dark: '#20211f' };
// The icon shows what a click switches to, matching the label.
const ICON = { dark: 'sun', light: 'moon' };

/** Only "light" means light. Missing, damaged, hand-edited or an old "auto" all mean dark. */
export function parseTheme(raw) {
  return raw === 'light' ? 'light' : 'dark';
}

export function nextTheme(choice) {
  return parseTheme(choice) === 'light' ? 'dark' : 'light';
}

/** Screen-reader label and tooltip: what a click does. */
export function themeLabel(choice) {
  return nextTheme(choice) === 'light' ? t('theme.switchToLight') : t('theme.switchToDark');
}

/** Colour for the browser bar: the theme's page background. */
export function themeColor(choice) {
  return THEME_BG[parseTheme(choice)];
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
    return 'dark';
  }
}

function saveTheme(choice) {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch (error) {
    console.warn('flux-rc: could not save the theme choice', error);
  }
}

function applyTheme(choice) {
  document.documentElement.setAttribute('data-theme', choice);
}

function applyThemeColor(choice) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor(choice));
}

/** Wires the topbar button. The choice is kept in memory too, so it still toggles if storage fails. */
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
