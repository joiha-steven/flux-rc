import { h, mountSection, issueSlot } from '../dom.js';
import { segmented, slider, selectField } from '../controls.js';
import { scales, describeMode } from '../../core/index.js';

const KEEP = { value: 'keep', label: 'Keep current' };
const SET = { value: 'set', label: 'Set' };
const NONE = { value: 'none', label: 'No limit' };
const FACTORY_SINGLE_LEVEL = 28;

// Limits are stored as a raw field; the UI works in levels. Find the field for a level.
function fieldForLevel(level, max) {
  for (let f = 1; f <= max; f++) if (scales.limitLevel(f) === level) return f;
  return max;
}
const THERMAL_MAX_FIELD = 60;
const celsiusOf = (field) => Math.round(scales.thermalCelsius(field));
const levelText = (level) => `Up to ${describeMode({ type: 'level', level })}`;

function row(title, path, ...kids) {
  return h('div', { class: 'card' }, h('h3', { class: 'card-title' }, title), kids, issueSlot(path));
}

export function mountAdvanced(root, store) {
  mountSection(root, store, (c) => {
    const set = (fn, meta) => store.update(fn, meta);
    const choose = (prop, label, options) => segmented({
      key: prop, label, hideLabel: true, options, value: c[prop].action, onChange: (v) => set((n) => { n[prop].action = v; }),
    });
    return [
      h('div', { class: 'warning-banner' }, h('strong', {}, 'Careful. '),
        'The original programmer only lets vendors change these. Wrong values can overheat the light or damage the battery. Leave them on Keep current unless you know why.'),
      row('Mode switch timeout', 'switchTimeout',
        choose('switchTimeout', 'Mode switch timeout setting', [KEEP, SET]),
        c.switchTimeout.action === 'set' && slider({
          key: 'switchTimeout-value', label: 'Mode switch timeout', min: 1, max: 63, value: c.switchTimeout.value,
          format: (v) => `${scales.timeoutSeconds(v).toFixed(1)} s`, ends: ['0.1 s', '2.0 s'],
          onInput: (v, meta) => set((n) => { n.switchTimeout.value = v; }, meta),
        })),
      row('Thermal cutoff', 'thermal',
        choose('thermal', 'Thermal cutoff setting', [KEEP, NONE, SET]),
        c.thermal.action === 'set' && slider({
          // The slider steps over the stored field values (1-60), so the label always matches what is saved.
          key: 'thermal-value', label: 'Thermal cutoff', min: 1, max: THERMAL_MAX_FIELD, value: c.thermal.value,
          format: (v) => `${celsiusOf(v)} °C · ${Math.round(scales.celsiusToFahrenheit(scales.thermalCelsius(v)))} °F`,
          ends: [`${celsiusOf(1)} °C`, `${celsiusOf(THERMAL_MAX_FIELD)} °C`],
          onInput: (v, meta) => set((n) => { n.thermal.value = v; }, meta),
        })), // The "No limit" warning comes from the validate issue under this card, so it shows once.
      row('One-cell output limit', 'singleLimit',
        choose('singleLimit', 'One-cell output limit setting', [KEEP, SET]),
        c.singleLimit.action === 'set' && slider({
          key: 'singleLimit-value', label: 'Highest level', min: 2, max: 31, value: scales.limitLevel(c.singleLimit.value),
          ticks: [FACTORY_SINGLE_LEVEL], format: levelText, ends: ['Level 2', 'Level 31 · factory default is 28'],
          note: (v) => (v >= 29 ? 'Overboost: these levels may not run stable.' : ''),
          onInput: (v, meta) => set((n) => { n.singleLimit.value = fieldForLevel(v, 30); }, meta),
        })),
      row('Two-cell output limit', 'dualLimit',
        choose('dualLimit', 'Two-cell output limit setting', [KEEP, NONE, SET]),
        c.dualLimit.action === 'set' && slider({
          key: 'dualLimit-value', label: 'Highest level', min: 2, max: 32, value: scales.limitLevel(c.dualLimit.value),
          format: levelText, ends: ['Level 2', 'Level 32'],
          onInput: (v, meta) => set((n) => { n.dualLimit.value = fieldForLevel(v, 31); }, meta),
        }),
        c.dualLimit.action === 'none' && h('p', { class: 'hint' }, 'All modes allowed with two cells, including afterburning.')),
      row('Programming PIN', 'pin',
        h('p', { class: 'hint' }, c.pin.action === 'keep' ? 'Leave the PIN as it is.' : 'The PIN entered with a clicky switch before programming.'),
        choose('pin', 'Programming PIN setting', [KEEP, SET]),
        c.pin.action === 'set' && h('div', { class: 'pin-row' }, [4, 8, 8].map((max, i) => selectField({
          key: `pin-${i}`, label: `Digit ${i + 1}`, value: c.pin.digits[i],
          options: Array.from({ length: max }, (_, k) => ({ value: k + 1, label: String(k + 1) })),
          onChange: (v) => set((n) => { n.pin.digits[i] = Number(v); }),
        }))),
        c.pin.action === 'set' && h('p', { class: 'hint' }, 'PIN ', h('span', { class: 'mono' }, c.pin.digits.join('-')))),
    ];
  });
}
