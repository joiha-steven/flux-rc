// Language switcher in the topbar: a button showing the current language's short label, and a menu
// of languages (each in its own name) that saves the choice and reloads. Logic for which languages
// exist and how one is picked lives in i18n.js.
import { h } from './dom.js';
import { t, locale, LANGUAGES, setLanguage } from './i18n.js';

/** Wires the topbar button `button` (inside a .menu-wrap element). */
export function mountLanguageMenu(button) {
  const wrap = button.parentElement;
  const current = LANGUAGES.find((l) => l.code === locale()) ?? LANGUAGES[0];
  const label = t('lang.current', { name: current.name });
  button.setAttribute('aria-label', label);
  button.title = label;
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
  button.textContent = current.short;

  const items = LANGUAGES.map((language) => h('button', {
    type: 'button',
    class: 'menu-item lang-item',
    role: 'menuitemradio',
    'aria-checked': String(language.code === current.code),
    lang: language.code,
    tabindex: '-1',
    onclick: () => choose(language.code),
  }, language.name));
  const menu = h('div', { class: 'menu lang-menu', role: 'menu', 'aria-label': t('lang.label'), hidden: true }, items);
  wrap.append(menu);

  const isOpen = () => !menu.hidden;
  function open() {
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    items[LANGUAGES.indexOf(current)].focus();
  }
  function close(returnFocus) {
    if (!isOpen()) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }
  function choose(code) {
    if (code === current.code) { close(true); return; }
    setLanguage(code);
  }

  button.addEventListener('click', () => (isOpen() ? close(true) : open()));
  button.addEventListener('keydown', (e) => {
    // Enter and Space reach the click handler natively; handling them here too re-closes the menu in browsers that click on keyup.
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!isOpen()) open(); }
  });
  menu.addEventListener('keydown', (e) => {
    const index = items.indexOf(document.activeElement);
    const move = (to) => { e.preventDefault(); items[(to + items.length) % items.length].focus(); };
    if (e.key === 'ArrowDown') move(index + 1);
    else if (e.key === 'ArrowUp') move(index - 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(items.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'Tab') close(false);
  });
  document.addEventListener('click', (e) => { if (isOpen() && !wrap.contains(e.target)) close(false); });
}
