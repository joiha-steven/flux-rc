// Behaviour: four option cards; each opens a small dialog with the choices.
import { h, mountSection, issueSlot } from '../dom.js';
import { segmented, slider } from '../controls.js';
import { openDialog } from '../dialog.js';
import { icon } from '../icons.js';
import { scales } from '../../core/index.js';

const MEMORY = [
  { value: 'none', label: 'No memory', desc: 'Always starts in mode 1' },
  { value: 'standard', label: 'Standard', desc: 'Starts in the last mode used' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Starts in the last mode; cycling restarts from mode 1' },
];
const PROTECTION = [
  { value: true, label: 'On', desc: 'Stops the light before the cell is over-discharged.' },
  { value: false, label: 'Off', desc: 'Use this only with protected cells.' },
];
const STRETCH = [
  { value: true, label: 'On', desc: 'Greatly extends runtime and battery life.' },
  { value: false, label: 'Off', desc: 'Shorter runtime, but constant output.' },
];
const BOUNCE = [
  { value: 'keep', label: 'Keep current', desc: 'Leave the sensor as it is' },
  { value: 'off', label: 'Not in use', desc: 'The bounce switch is not active' },
  { value: 'set', label: 'Set sensitivity', desc: 'Low is 50, high is 100; normal is about 85' },
];
const NORMAL_BOUNCE = 179;
const memoryName = (v) => ({ none: 'No memory', standard: 'Standard memory', hybrid: 'Hybrid memory' })[v];
const sensitivity = (v) => `Sensitivity ${Math.round(scales.bounceSensitivity(v))}${v === NORMAL_BOUNCE ? ' (normal)' : ''}`;
const bounceLabel = (b) => (b.action === 'keep' ? 'Bounce sensor: keep current'
  : b.action === 'off' ? 'Bounce sensor: not in use'
    : `Bounce sensor: sensitivity ${Math.round(scales.bounceSensitivity(b.value))}`);

function dialogs(store) {
  const set = (fn, meta) => store.update(fn, meta);
  return {
    memory: ['Memory', (c) => [segmented({ key: 'memory', label: 'Memory', variant: 'cards', options: MEMORY, value: c.memory, onChange: (v) => set((n) => { n.memory = v; }) })]],
    protection: ['Lithium-ion protection', (c) => [
      segmented({ key: 'protection', label: 'Lithium-ion protection', variant: 'cards', value: c.protection, options: PROTECTION, onChange: (v) => set((n) => { n.protection = v; }) }),
      issueSlot('options')]],
    stretch: ['Battery stretch', (c) => [
      segmented({ key: 'stretch', label: 'Battery stretch', variant: 'cards', value: c.stretch, options: STRETCH, onChange: (v) => set((n) => { n.stretch = v; }) }),
      issueSlot('options')]],
    bounce: ['Bounce sensor', (c) => [
      segmented({ key: 'bounce', label: 'Bounce sensor', variant: 'cards', value: c.bounce.action, options: BOUNCE, onChange: (v) => set((n) => { n.bounce.action = v; }) }),
      c.bounce.action === 'set' && slider({
        key: 'bounce-value', label: 'Bounce sensitivity', min: 1, max: 254, value: c.bounce.value, ticks: [NORMAL_BOUNCE], format: sensitivity, ends: ['Low · 50', 'High · 100'],
        onInput: (v, meta) => set((n) => { n.bounce.value = v; }, meta),
      }),
      issueSlot('bounce')]],
  };
}

export function mountBehaviour(root, store) {
  const defs = dialogs(store);
  const cards = (c) => [
    ['memory', 'memory', memoryName(c.memory)],
    ['protection', 'shield', `Li-ion protection ${c.protection ? 'on' : 'off'}`],
    ['stretch', 'bars', `Battery stretch ${c.stretch ? 'on' : 'off'}`],
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
