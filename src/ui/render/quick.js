// Quick start: three pill buttons. One tap loads one (with Undo); the matching one is filled amber.
import { h, mountSection } from '../dom.js';
import { QUICK_PRESETS } from '../../data/quick-presets.js';
import { normalizeConfig } from '../../core/index.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

const sorted = (v) => (Array.isArray(v) ? v.map(sorted)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sorted(v[k])])) : v);
const same = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
const asConfig = (preset) => normalizeConfig(structuredClone(preset.config));

export function loadQuick(store, preset) {
  const before = store.get();
  store.replace(asConfig(preset));
  showToast(t('toast.loadedName', { name: preset.name }), { label: t('common.undo'), onClick: () => store.replace(before) });
}

export function mountQuick(root, store) {
  mountSection(root, store, (c) => {
    const selected = QUICK_PRESETS.find((q) => same(asConfig(q), c));
    return [
      h('div', { class: 'pills', role: 'group', 'aria-label': t('quick.label') }, QUICK_PRESETS.map((q) =>
        h('button', { type: 'button', class: 'pill', 'aria-pressed': String(q === selected), 'data-k': `quick:${q.id}`, onclick: () => loadQuick(store, q) }, q.name))),
      h('p', { class: 'quick-desc' }, selected ? selected.description : ''),
    ];
  });
}
