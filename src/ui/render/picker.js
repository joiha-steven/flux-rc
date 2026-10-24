// Mode picker: a grid of beam thumbnails (32 levels, then the other modes); custom signal controls appear inside.
import { h } from '../dom.js';
import { openDialog } from '../dialog.js';
import { segmented } from '../controls.js';
import { LEVELS } from '../../core/index.js';
import { t } from '../i18n.js';
import { durationText } from '../mode-text.js';
import { ENTRIES, entryIndex, entryMode, beam, entryName, entryDetail, entryFull } from '../modes-list.js';

function signalControls(store, key, i, mode) {
  const seg = (field, label, options) => segmented({
    key: `pick-${field}`, label, value: mode[field], options,
    onChange: (v) => store.update((n) => { n[key].modes[i][field] = v; }),
  });
  return h('div', { class: 'signal-grid' },
    seg('color', t('picker.colour'), [{ value: 'red', label: t('picker.colour.red') }, { value: 'white', label: t('picker.colour.white') }]),
    seg('double', t('picker.flashes'), [{ value: false, label: t('picker.flashes.single') }, { value: true, label: t('picker.flashes.double') }]),
    seg('onMs', t('picker.onTime'), [{ value: 64, label: durationText(64) }, { value: 250, label: t('picker.quarterSecond') }]),
    seg('offMs', t('picker.offTime'), [{ value: 32, label: durationText(32) }, { value: 250, label: t('picker.quarterSecond') }, { value: 1000, label: durationText(1000) }, { value: 3000, label: durationText(3000) }]));
}

const OTHER_ORDER = [34, 1, 35, 36, 37, 38, 0]; // ENTRIES indexes: afterburning, moonlight, S.O.S., strobe, beacon, signal, not used
const LEVEL_INDEXES = Array.from({ length: 32 }, (_, i) => i + 2);

/** `slotMode` is the slot's own mode: the current cell shows it, so a custom signal shows its real colour and timing. */
function cell(index, current, slotMode, onPick) {
  const mode = index === current && slotMode ? slotMode : ENTRIES[index];
  const art = beam(mode);
  const level = mode?.type === 'level';
  const text = entryFull(mode);
  const inner = level
    ? [h('b', { class: 'pick-num mono' }, mode.level), h('span', { class: 'pick-power mono' }, LEVELS[mode.level - 1].power)]
    : [h('span', { class: 'pick-text' }, h('b', {}, mode ? entryName(mode) : t('mode.notUsed')), h('span', { class: 'pick-detail' }, entryDetail(mode)))];
  return h('button', {
    type: 'button', class: `pick ${level ? 'pick-level' : 'pick-wide'} ${mode ? '' : 'pick-unused'}`, 'aria-current': index === current ? 'true' : null,
    'aria-label': text.replaceAll(' · ', ', '), 'data-k': `pick:${index}`, 'data-text': text, tabindex: -1, onclick: () => onPick(index),
  }, art && h('img', { class: 'pick-img', src: art.thumb, alt: '', width: 96, height: 116, decoding: 'async', style: `filter: brightness(${art.shade})` }),
  !art && h('span', { class: 'pick-plus', 'aria-hidden': 'true' }, '+'),
  ...inner);
}

/** Roving focus: arrows move to the nearest cell in that direction (works across the two grids). */
function arrowKeys(root) {
  root.addEventListener('keydown', (e) => {
    const cells = [...root.querySelectorAll('.pick')];
    const at = cells.indexOf(document.activeElement);
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    let next;
    if (at < 0) return;
    if (step) next = cells[at + step];
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const from = cells[at].getBoundingClientRect();
      const down = e.key === 'ArrowDown';
      const beyond = cells.filter((c) => { const r = c.getBoundingClientRect(); return down ? r.top > from.top + 4 : r.top < from.top - 4; });
      const edge = beyond.length && (down ? Math.min : Math.max)(...beyond.map((c) => c.getBoundingClientRect().top));
      next = beyond.filter((c) => Math.abs(c.getBoundingClientRect().top - edge) < 4)
        .sort((a, b) => Math.abs(a.getBoundingClientRect().left - from.left) - Math.abs(b.getBoundingClientRect().left - from.left))[0];
    } else return;
    e.preventDefault();
    if (!next) return;
    cells[at].tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  });
}

/** Detail bar: shows the hovered or focused cell, falls back to the current choice. Hidden from screen readers: each cell's own label already says the same. */
function detailBar(root, bar) {
  const current = () => root.querySelector('[aria-current="true"]')?.dataset.text ?? '';
  const show = (e) => { const c = e.target.closest?.('.pick'); bar.textContent = c ? c.dataset.text : current(); };
  root.addEventListener('mouseover', show);
  root.addEventListener('focusin', show);
  root.addEventListener('mouseleave', () => { bar.textContent = document.activeElement?.closest?.('.pick-grid') ? document.activeElement.dataset.text : current(); });
  bar.textContent = current();
}

export function openPicker(store, key, i) {
  const title = t(`picker.title.${key}`, { n: i + 1 });
  const dlg = openDialog(title, (render, d) => {
    const mode = store.get()[key].modes[i];
    const current = entryIndex(mode);
    const pick = (index) => {
      store.update((n) => { n[key].modes[i] = entryMode(index, n[key].modes[i]); });
      if (ENTRIES[index]?.type === 'signal') render(); else d.close();
    };
    const bar = h('div', { class: 'pick-detailbar', 'aria-hidden': 'true' });
    const levels = h('div', { class: 'pick-grid pick-levels', role: 'group', 'aria-label': t('picker.levels') }, LEVEL_INDEXES.map((x) => cell(x, current, mode, pick)));
    const others = h('div', { class: 'pick-grid pick-others', role: 'group', 'aria-label': t('picker.others') },
      OTHER_ORDER.filter((x) => x !== 0 || i > 0).map((x) => cell(x, current, mode, pick)));
    const grids = h('div', { class: 'pick-grids' }, levels, h('h3', { class: 'pick-heading' }, t('picker.others')), others);
    (grids.querySelector('[aria-current="true"]') ?? grids.querySelector('.pick')).tabIndex = 0;
    arrowKeys(grids);
    detailBar(grids, bar);
    return [
      grids,
      mode?.type === 'signal' && h('div', { class: 'pick-signal' }, h('h3', { class: 'card-title' }, t('picker.signal')), signalControls(store, key, i, mode),
        h('div', { class: 'issues', 'data-issues': `${key}.modes.${i}` }),
        h('button', { type: 'button', class: 'btn btn-primary', onclick: () => d.close() }, t('common.done'))),
      bar,
    ];
  }, { className: 'picker', initialFocus: '.pick[tabindex="0"]' });
  dlg.addEventListener('close', () => document.querySelector(`[data-k="${key}.modes.${i}:open"]`)?.focus());
  dlg.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  return dlg;
}
