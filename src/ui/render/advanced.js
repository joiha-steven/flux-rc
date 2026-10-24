import { h, mountSection, issueSlot } from '../dom.js';
import { segmented, slider, selectField } from '../controls.js';
import { scales } from '../../core/index.js';
import { t, tParts } from '../i18n.js';
import { modeLabel } from '../mode-text.js';

const KEEP = () => ({ value: 'keep', label: t('advanced.keep') });
const SET = () => ({ value: 'set', label: t('advanced.set') });
const NONE = () => ({ value: 'none', label: t('advanced.none') });
const FACTORY_SINGLE_LEVEL = 28;

// Limits are stored as a raw field; the UI works in levels. Find the field for a level.
function fieldForLevel(level, max) {
  for (let f = 1; f <= max; f++) if (scales.limitLevel(f) === level) return f;
  return max;
}
const THERMAL_MAX_FIELD = 60;
const celsiusOf = (field) => Math.round(scales.thermalCelsius(field));
const levelText = (level) => t('advanced.upTo', { mode: modeLabel({ type: 'level', level }) });
const levelName = (level) => t('mode.level', { level });

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
      h('div', { class: 'warning-banner' }, tParts('advanced.warning', { careful: h('strong', {}, t('advanced.careful')) })),
      row(t('advanced.timeout.title'), 'switchTimeout',
        choose('switchTimeout', t('advanced.timeout.setting'), [KEEP(), SET()]),
        c.switchTimeout.action === 'set' && slider({
          key: 'switchTimeout-value', label: t('advanced.timeout.slider'), min: 1, max: 63, value: c.switchTimeout.value,
          format: (v) => t('unit.seconds', { n: scales.timeoutSeconds(v).toFixed(1) }), ends: [t('unit.seconds', { n: '0.1' }), t('unit.seconds', { n: '2.0' })],
          onInput: (v, meta) => set((n) => { n.switchTimeout.value = v; }, meta),
        })),
      row(t('advanced.thermal.title'), 'thermal',
        choose('thermal', t('advanced.thermal.setting'), [KEEP(), NONE(), SET()]),
        c.thermal.action === 'set' && slider({
          // The slider steps over the stored field values (1-60), so the label always matches what is saved.
          key: 'thermal-value', label: t('advanced.thermal.slider'), min: 1, max: THERMAL_MAX_FIELD, value: c.thermal.value,
          format: (v) => t('advanced.thermal.value', { c: celsiusOf(v), f: Math.round(scales.celsiusToFahrenheit(scales.thermalCelsius(v))) }),
          ends: [t('unit.celsius', { n: celsiusOf(1) }), t('unit.celsius', { n: celsiusOf(THERMAL_MAX_FIELD) })],
          onInput: (v, meta) => set((n) => { n.thermal.value = v; }, meta),
        })), // The "No limit" warning comes from the validate issue under this card, so it shows once.
      row(t('advanced.singleLimit.title'), 'singleLimit',
        choose('singleLimit', t('advanced.singleLimit.setting'), [KEEP(), SET()]),
        c.singleLimit.action === 'set' && slider({
          key: 'singleLimit-value', label: t('advanced.highestLevel'), min: 2, max: 31, value: scales.limitLevel(c.singleLimit.value),
          ticks: [FACTORY_SINGLE_LEVEL], format: levelText, ends: [levelName(2), t('advanced.singleLimit.max', { level: 31, factory: FACTORY_SINGLE_LEVEL })],
          note: (v) => (v >= 29 ? t('advanced.singleLimit.overboost') : ''),
          onInput: (v, meta) => set((n) => { n.singleLimit.value = fieldForLevel(v, 30); }, meta),
        })),
      row(t('advanced.dualLimit.title'), 'dualLimit',
        choose('dualLimit', t('advanced.dualLimit.setting'), [KEEP(), NONE(), SET()]),
        c.dualLimit.action === 'set' && slider({
          key: 'dualLimit-value', label: t('advanced.highestLevel'), min: 2, max: 32, value: scales.limitLevel(c.dualLimit.value),
          format: levelText, ends: [levelName(2), levelName(32)],
          onInput: (v, meta) => set((n) => { n.dualLimit.value = fieldForLevel(v, 31); }, meta),
        }),
        c.dualLimit.action === 'none' && h('p', { class: 'hint' }, t('advanced.dualLimit.none'))),
      row(t('advanced.pin.title'), 'pin',
        h('p', { class: 'hint' }, t(c.pin.action === 'keep' ? 'advanced.pin.keepHint' : 'advanced.pin.setHint')),
        choose('pin', t('advanced.pin.setting'), [KEEP(), SET()]),
        c.pin.action === 'set' && h('div', { class: 'pin-row' }, [4, 8, 8].map((max, i) => selectField({
          key: `pin-${i}`, label: t('advanced.pin.digit', { n: i + 1 }), value: c.pin.digits[i],
          options: Array.from({ length: max }, (_, k) => ({ value: k + 1, label: String(k + 1) })),
          onChange: (v) => set((n) => { n.pin.digits[i] = Number(v); }),
        }))),
        c.pin.action === 'set' && h('p', { class: 'hint' }, tParts('advanced.pin.value', { pin: h('span', { class: 'mono' }, c.pin.digits.join('-')) }))),
    ];
  });
}
