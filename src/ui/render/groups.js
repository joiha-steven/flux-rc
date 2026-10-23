// Mode groups: battery header, switch, and four photo tiles per enabled group.
import { h, mountSection } from '../dom.js';
import { switchRow, segmented } from '../controls.js';
import { icon } from '../icons.js';
import { ENTRIES, entryIndex, entryMode, beam, tileLabel, tileLines, tileCode, entryName } from '../modes-list.js';
import { openPicker } from './picker.js';

const GROUPS = {
  single: {
    title: 'One cell',
    note: 'The 371D light engine limits the peak battery current to about 5 A, so one-cell output is normally capped at 17 W (level 28). Vendors can change this.',
    sub: () => '1 × 18650 Li-ion', img: () => 'battery-1s-li-ion' },
  dual: {
    title: 'Two cells in series',
    note: 'Higher levels draw more current. Make sure your cells can deliver it; too much current can make a cell fail or catch fire.',
    sub: (c) => (c.dual.cells === 'cr123a' ? '2 × CR123A (series)' : '2 × 18650 Li-ion (series)'),
    img: (c) => (c.dual.cells === 'cr123a' ? 'battery-2s-cr123a' : 'battery-2s-li-ion'),
  },
};

function describe(mode, n) {
  return `Mode ${n}: ${entryName(mode)}${mode.type === 'level' ? `, ${tileLabel(mode).replace(' · ', ', ')}` : ''}`;
}

/** first: the first group's tiles are the first thing seen, so their photos load with high priority. */
function tile(store, key, i, mode, first) {
  const path = `${key}.modes.${i}`;
  const open = () => openPicker(store, key, i);
  const step = (dir) => store.update((n) => {
    const list = n[key].modes;
    const next = Math.min(ENTRIES.length - 1, Math.max(i === 0 ? 1 : 0, entryIndex(list[i]) + dir));
    list[i] = entryMode(next, list[i]);
  });
  const idx = entryIndex(mode);
  const low = i === 0 ? 1 : 0;
  const stepBtn = (dir, name) => h('button', {
    type: 'button', class: 'step', 'aria-label': `Mode ${i + 1}: ${name}`, 'data-k': `${path}:${dir}`,
    disabled: dir > 0 ? idx >= ENTRIES.length - 1 : idx <= low, onclick: () => step(dir),
    title: (dir > 0 ? idx >= ENTRIES.length - 1 : idx <= low) ? `This is already the ${dir > 0 ? 'last' : 'first'} option` : null,
  }, h('span', {}, icon(dir > 0 ? 'chevronUp' : 'chevronDown', 16)));
  const art = beam(mode);
  const main = mode
    ? h('button', { type: 'button', class: 'tile-main', 'aria-label': `${describe(mode, i + 1)}. Change mode`, 'data-k': `${path}:open`, onclick: open },
      h('img', {
        class: 'tile-img', src: art.src, alt: '', width: 365, height: 442, decoding: 'async', style: `filter: brightness(${art.shade})`,
        ...(first ? { fetchpriority: 'high' } : { loading: 'lazy' }),
      }),
      h('span', { class: 'tile-shade' }),
      h('span', { class: 'tile-label mono' }, tileLines(mode).map((line) => h('span', {}, line))),
      h('span', { class: 'tile-badge' }, i + 1),
      h('span', { class: 'tile-code' }, mode.type === 'level' && h('small', { class: 'mono' }, 'LVL'), h('b', { class: 'mono' }, tileCode(mode))),
      h('span', { class: 'tile-issue', 'data-issues': path, 'data-badge': '' }))
    : h('button', { type: 'button', class: 'tile-main', 'aria-label': `Mode ${i + 1}: not used. Choose a mode`, 'data-k': `${path}:open`, onclick: open },
      h('span', { class: 'tile-badge' }, i + 1), h('span', { class: 'tile-empty' }, 'Not used', h('b', {}, '+')));
  return h('li', { class: `tile ${mode ? '' : 'unused'} ${mode?.type === 'afterburning' ? 'burn' : ''}` },
    main, h('div', { class: 'steps' }, stepBtn(1, 'next option'), stepBtn(-1, 'previous option')));
}

function group(store, c, key) {
  const g = GROUPS[key];
  const data = c[key];
  const other = key === 'single' ? c.dual : c.single;
  const head = h('div', { class: 'group-head' },
    h('img', { class: 'battery', src: `assets/${g.img(c)}.webp`, alt: '', width: 80, height: 24 }),
    h('div', { class: 'group-title' }, h('h2', {}, g.title), h('p', { class: 'sub' }, g.sub(c))),
    h('div', { class: 'group-controls' },
      key === 'dual' && data.enabled && segmented({
        key: 'dual-cells', label: 'Cell type', hideLabel: true, value: data.cells,
        options: [{ value: 'li-ion', label: '2 × Li-ion' }, { value: 'cr123a', label: '2 × CR123A' }],
        onChange: (v) => store.update((n) => { n.dual.cells = v; }),
      }),
      switchRow({ key: `${key}-on`, label: 'Use', aria: `Use ${g.title.toLowerCase()}`, checked: data.enabled, onChange: (on) => store.update((n) => { n[key].enabled = on; }) })));
  const body = data.enabled
    ? [h('p', { class: 'group-note' }, g.note), h('ol', { class: 'tiles' }, data.modes.map((m, i) => tile(store, key, i, m, key === 'single' || !c.single.enabled))), h('div', { class: 'return-line', 'aria-hidden': 'true' })]
    : [h('p', { class: 'off-note' }, other.enabled ? `Not used. This set copies the ${key === 'single' ? 'two-cell' : 'one-cell'} modes.` : 'Modes stay as they are on the light.')];
  return h('section', { class: 'group', 'aria-label': g.title }, head, body);
}

export function mountGroups(root, store) {
  mountSection(root, store, (c) => [group(store, c, 'single'), group(store, c, 'dual')]);
}
