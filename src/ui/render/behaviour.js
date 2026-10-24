// Behaviour: four option cards; each opens a small dialog with the choices.
import { h, mountSection, issueSlot } from '../dom.js';
import { segmented, slider } from '../controls.js';
import { openDialog } from '../dialog.js';
import { icon } from '../icons.js';
import { scales } from '../../core/index.js';
import { t } from '../i18n.js';

// Choices as functions, so the text is looked up when a dialog is built.
const choices = (area, values) => values.map((value) => ({ value, label: t(`behaviour.${area}.${value}`), desc: t(`behaviour.${area}.${value}.desc`) }));
const onOff = (area) => [
  { value: true, label: t('behaviour.on'), desc: t(`behaviour.${area}.on.desc`) },
  { value: false, label: t('behaviour.off'), desc: t(`behaviour.${area}.off.desc`) },
];
const MEMORY = () => choices('memory', ['none', 'standard', 'hybrid']);
const PROTECTION = () => onOff('protection');
const STRETCH = () => onOff('stretch');
const BOUNCE = () => choices('bounce', ['keep', 'off', 'set']);
const NORMAL_BOUNCE = 179;
const memoryName = (v) => t(`behaviour.memory.card.${v}`);
const sensitivity = (v) => t(v === NORMAL_BOUNCE ? 'behaviour.bounce.sensitivityNormal' : 'behaviour.bounce.sensitivity', { n: Math.round(scales.bounceSensitivity(v)) });
const bounceLabel = (b) => (b.action === 'keep' ? t('behaviour.bounce.cardKeep')
  : b.action === 'off' ? t('behaviour.bounce.cardOff')
    : t('behaviour.bounce.cardSet', { n: Math.round(scales.bounceSensitivity(b.value)) }));

function dialogs(store) {
  const set = (fn, meta) => store.update(fn, meta);
  return {
    memory: [t('behaviour.memory.title'), (c) => [segmented({ key: 'memory', label: t('behaviour.memory.title'), variant: 'cards', options: MEMORY(), value: c.memory, onChange: (v) => set((n) => { n.memory = v; }) })]],
    protection: [t('behaviour.protection.title'), (c) => [
      segmented({ key: 'protection', label: t('behaviour.protection.title'), variant: 'cards', value: c.protection, options: PROTECTION(), onChange: (v) => set((n) => { n.protection = v; }) }),
      issueSlot('options')]],
    stretch: [t('behaviour.stretch.title'), (c) => [
      segmented({ key: 'stretch', label: t('behaviour.stretch.title'), variant: 'cards', value: c.stretch, options: STRETCH(), onChange: (v) => set((n) => { n.stretch = v; }) }),
      issueSlot('options')]],
    bounce: [t('behaviour.bounce.title'), (c) => [
      segmented({ key: 'bounce', label: t('behaviour.bounce.title'), variant: 'cards', value: c.bounce.action, options: BOUNCE(), onChange: (v) => set((n) => { n.bounce.action = v; }) }),
      c.bounce.action === 'set' && slider({
        key: 'bounce-value', label: t('behaviour.bounce.slider'), min: 1, max: 254, value: c.bounce.value, ticks: [NORMAL_BOUNCE], format: sensitivity, ends: [t('behaviour.bounce.low', { n: 50 }), t('behaviour.bounce.high', { n: 100 })],
        onInput: (v, meta) => set((n) => { n.bounce.value = v; }, meta),
      }),
      issueSlot('bounce')]],
  };
}

export function mountBehaviour(root, store) {
  const defs = dialogs(store);
  const cards = (c) => [
    ['memory', 'memory', memoryName(c.memory)],
    ['protection', 'shield', t(c.protection ? 'behaviour.protection.cardOn' : 'behaviour.protection.cardOff')],
    ['stretch', 'bars', t(c.stretch ? 'behaviour.stretch.cardOn' : 'behaviour.stretch.cardOff')],
    ['bounce', 'bounce', bounceLabel(c.bounce)],
  ];
  mountSection(root, store, (c) => [h('div', { class: 'options' }, cards(c).map(([id, ic, label]) =>
    h('button', {
      type: 'button', class: 'option', 'data-k': `option:${id}`, 'aria-haspopup': 'dialog',
      onclick: () => {
        const [title, build] = defs[id];
        const dlg = openDialog(title, () => build(store.get()));
        const off = store.subscribe((_c, meta) => { if (!meta.live) dlg.rerender(); });
        dlg.addEventListener('close', () => {
          off();
          store.replace(store.get()); // final, non-live update so the card shows the committed value
          document.querySelector(`[data-k="option:${id}"]`)?.focus();
        });
      },
    }, icon(ic, 24), h('span', { class: 'option-label' }, label), icon('chevronRight', 16))))]);
}
