// Mode picker: every entry with a beam thumbnail; custom signal controls appear inside.
import { h } from '../dom.js';
import { openDialog } from '../dialog.js';
import { segmented } from '../controls.js';
import { ENTRIES, entryIndex, entryMode, beam, entryName, entryDetail } from '../modes-list.js';

function signalControls(store, key, i, mode) {
  const seg = (field, label, options) => segmented({
    key: `pick-${field}`, label, value: mode[field], options,
    onChange: (v) => store.update((n) => { n[key].modes[i][field] = v; }),
  });
  return h('div', { class: 'signal-grid' },
    seg('color', 'Colour', [{ value: 'red', label: 'Red' }, { value: 'white', label: 'White' }]),
    seg('double', 'Flashes', [{ value: false, label: 'Single' }, { value: true, label: 'Double' }]),
    seg('onMs', 'On time', [{ value: 64, label: '64 ms' }, { value: 250, label: '1/4 s' }]),
    seg('offMs', 'Off time', [{ value: 32, label: '32 ms' }, { value: 250, label: '1/4 s' }, { value: 1000, label: '1 s' }, { value: 3000, label: '3 s' }]));
}

function row(mode, index, current, onPick) {
  const art = beam(mode);
  const name = mode ? entryName(mode) : 'Not used';
  const detail = mode ? entryDetail(mode) : 'This slot is skipped';
  return h('li', {}, h('button', {
    type: 'button', class: 'pick', 'aria-current': index === current ? 'true' : null, 'data-k': `pick:${index}`, onclick: () => onPick(index),
  },
  art ? h('img', { class: 'pick-img', src: art.thumb, alt: '', width: 96, height: 116, decoding: 'async', style: `filter: brightness(${art.shade})`, loading: 'lazy' }) : h('span', { class: 'pick-img pick-none' }, '–'),
  h('span', { class: 'pick-text' }, h('b', {}, name), h('span', { class: 'pick-detail' }, detail))));
}

export function openPicker(store, key, i) {
  const title = `Mode ${i + 1} · ${key === 'single' ? 'One cell' : 'Two cells'}`;
  const dlg = openDialog(title, (render, d) => {
    const mode = store.get()[key].modes[i];
    const current = entryIndex(mode);
    const pick = (index) => {
      store.update((n) => { n[key].modes[i] = entryMode(index, n[key].modes[i]); });
      if (ENTRIES[index]?.type === 'signal') render(); else d.close();
    };
    return [
      h('ul', { class: 'pick-list' }, ENTRIES.map((e, index) => (index === 0 && i === 0 ? null : row(e, index, current, pick)))),
      mode?.type === 'signal' && h('div', { class: 'pick-signal' }, h('h3', { class: 'card-title' }, 'Custom signal'), signalControls(store, key, i, mode),
        h('div', { class: 'issues', 'data-issues': `${key}.modes.${i}` }),
        h('button', { type: 'button', class: 'btn btn-primary', onclick: () => d.close() }, 'Done')),
    ];
  }, { className: 'picker' });
  dlg.addEventListener('close', () => document.querySelector(`[data-k="${key}.modes.${i}:open"]`)?.focus());
  dlg.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'center' });
  return dlg;
}
