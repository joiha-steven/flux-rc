// Mode groups: battery header, switch, and four photo tiles per enabled group.
import { h, mountSection } from '../dom.js';
import { switchRow, segmented } from '../controls.js';
import { icon } from '../icons.js';
import { ENTRIES, entryIndex, entryMode, beam, tileLines, tileCode, entryName } from '../modes-list.js';
import { openPicker } from './picker.js';
import { t } from '../i18n.js';
import { LEVELS } from '../../core/index.js';

// Text is looked up per render (locale keys "groups.single.*" / "groups.dual.*").
const GROUPS = {
  single: {
    sub: () => t('groups.single.sub'), img: () => 'battery-1s-li-ion' },
  dual: {
    sub: (c) => t(c.dual.cells === 'cr123a' ? 'groups.dual.subCr123a' : 'groups.dual.subLiIon'),
    img: (c) => (c.dual.cells === 'cr123a' ? 'battery-2s-cr123a' : 'battery-2s-li-ion'),
  },
};

function describe(mode, n) {
  if (mode.type !== 'level') return t('groups.tile.mode', { n, name: entryName(mode) });
  const { percent, power } = LEVELS[mode.level - 1];
  return t('groups.tile.modeLevel', { n, name: entryName(mode), percent, power });
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
  const stepBtn = (dir) => h('button', {
    type: 'button', class: 'step', 'aria-label': t(dir > 0 ? 'groups.tile.next' : 'groups.tile.previous', { n: i + 1 }), 'data-k': `${path}:${dir}`,
    disabled: dir > 0 ? idx >= ENTRIES.length - 1 : idx <= low, onclick: () => step(dir),
    title: (dir > 0 ? idx >= ENTRIES.length - 1 : idx <= low) ? t(dir > 0 ? 'groups.tile.atLast' : 'groups.tile.atFirst') : null,
  }, h('span', {}, icon(dir > 0 ? 'chevronUp' : 'chevronDown', 16)));
  const art = beam(mode);
  const main = mode
    ? h('button', { type: 'button', class: 'tile-main', 'aria-label': t('groups.tile.change', { mode: describe(mode, i + 1) }), 'data-k': `${path}:open`, onclick: open },
      h('img', {
        class: 'tile-img', src: art.src, alt: '', width: 365, height: 442, decoding: 'async', style: `filter: brightness(${art.shade})`,
        ...(first ? { fetchpriority: 'high' } : { loading: 'lazy' }),
      }),
      h('span', { class: 'tile-shade' }),
      h('span', { class: 'tile-label mono' }, tileLines(mode).map((line) => h('span', {}, line))),
      h('span', { class: 'tile-badge' }, i + 1),
      h('span', { class: 'tile-code' }, mode.type === 'level' && h('small', { class: 'mono' }, t('mode.code.level')), h('b', { class: 'mono' }, tileCode(mode))),
      h('span', { class: 'tile-issue', 'data-issues': path, 'data-badge': '' }))
    : h('button', { type: 'button', class: 'tile-main', 'aria-label': t('groups.tile.unused', { n: i + 1 }), 'data-k': `${path}:open`, onclick: open },
      h('span', { class: 'tile-badge' }, i + 1), h('span', { class: 'tile-empty' }, t('mode.notUsed'), h('b', {}, '+')));
  return h('li', { class: `tile ${mode ? '' : 'unused'} ${mode?.type === 'afterburning' ? 'burn' : ''}` },
    main, h('div', { class: 'steps' }, stepBtn(1), stepBtn(-1)));
}

function group(store, c, key) {
  const g = GROUPS[key];
  const data = c[key];
  const other = key === 'single' ? c.dual : c.single;
  const head = h('div', { class: 'group-head' },
    h('img', { class: 'battery', src: `assets/${g.img(c)}.webp`, alt: '', width: 80, height: 24 }),
    h('div', { class: 'group-title' }, h('h2', {}, t(`groups.${key}.title`)), h('p', { class: 'sub' }, g.sub(c))),
    h('div', { class: 'group-controls' },
      key === 'dual' && data.enabled && segmented({
        key: 'dual-cells', label: t('groups.cellType'), hideLabel: true, value: data.cells,
        options: [{ value: 'li-ion', label: t('groups.cells.liIon') }, { value: 'cr123a', label: t('groups.cells.cr123a') }],
        onChange: (v) => store.update((n) => { n.dual.cells = v; }),
      }),
      switchRow({ key: `${key}-on`, label: t('groups.use'), aria: t(`groups.${key}.use`), checked: data.enabled, onChange: (on) => store.update((n) => { n[key].enabled = on; }) })));
  const body = data.enabled
    ? [h('p', { class: 'group-note' }, t(`groups.${key}.note`)), h('ol', { class: 'tiles' }, data.modes.map((m, i) => tile(store, key, i, m, key === 'single' || !c.single.enabled))), h('div', { class: 'return-line', 'aria-hidden': 'true' })]
    : [h('p', { class: 'off-note' }, other.enabled ? t(`groups.${key}.offCopies`) : t('groups.offKeep'))];
  return h('section', { class: 'group', 'aria-label': t(`groups.${key}.title`) }, head, body);
}

export function mountGroups(root, store) {
  mountSection(root, store, (c) => [group(store, c, 'single'), group(store, c, 'dual')]);
}
