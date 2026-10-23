// Reusable form controls. `key` becomes data-k so focus survives a re-render.
import { h, uid } from './dom.js';

export function switchRow({ key, label, aria, desc, checked, onChange }) {
  return h('label', { class: 'switch' },
    h('input', { type: 'checkbox', role: 'switch', 'aria-label': aria, checked, 'data-k': key, onchange: (e) => onChange(e.target.checked) }),
    h('span', { class: 'switch-track', 'aria-hidden': 'true' }),
    h('span', { class: 'switch-text' },
      h('span', { class: 'switch-label' }, label),
      desc && h('span', { class: 'hint' }, desc)));
}

/** options: [{ value, label, desc? }]. variant 'cards' shows descriptions. */
export function segmented({ key, label, hideLabel, options, value, onChange, variant }) {
  const name = uid('seg');
  return h('fieldset', { class: `seg-field ${variant === 'cards' ? 'cards' : ''}` },
    h('legend', { class: hideLabel ? 'sr' : 'field-label' }, label),
    h('div', { class: 'seg' }, options.map((o) =>
      h('label', { class: 'seg-opt' },
        h('input', { type: 'radio', name, value: String(o.value), checked: o.value === value, 'data-k': `${key}:${o.value}`, onchange: () => onChange(o.value) }),
        h('span', {}, o.label, o.desc && h('span', { class: 'opt-desc' }, o.desc))))));
}

/**
 * onInput(number, meta) fires while dragging with meta { live: true } (the readout is updated here,
 * nothing is rebuilt) and once more with meta {} when the change is committed, so sections that show
 * the value elsewhere can rebuild. note(number) returns an optional line shown under the slider.
 */
export function slider({ key, label, hideLabel, min, max, step = 1, value, format, onInput, ticks, ends, note }) {
  const id = uid('rng');
  const listId = ticks ? uid('ticks') : null;
  const out = h('output', { class: 'slider-out', for: id }, format(value));
  const noteEl = note && h('p', { class: 'hint slider-note', hidden: !note(value) }, note(value));
  const showNote = (v) => { noteEl.textContent = note(v); noteEl.hidden = !note(v); };
  const input = h('input', {
    type: 'range', id, min, max, step, value, 'data-k': key, list: listId, 'aria-valuetext': format(value),
    oninput: (e) => {
      const v = Number(e.target.value);
      out.textContent = format(v);
      input.setAttribute('aria-valuetext', format(v));
      if (note) showNote(v);
      onInput(v, { live: true });
    },
    onchange: (e) => onInput(Number(e.target.value), {}),
  });
  return h('div', { class: 'slider-field' },
    h('div', { class: 'slider-head' }, h('label', { for: id, class: hideLabel ? 'sr' : '' }, label), out),
    input,
    noteEl,
    ticks && h('datalist', { id: listId }, ticks.map((t) => h('option', { value: t }))),
    ends && h('div', { class: 'slider-ends', 'aria-hidden': 'true' }, h('span', {}, ends[0]), h('span', {}, ends[1])));
}

export function selectField({ key, label, hideLabel, options, value, onChange }) {
  const id = uid('sel');
  return h('div', { class: 'select-field' },
    h('label', { for: id, class: hideLabel ? 'sr' : 'field-label' }, label),
    h('select', { id, value: String(value), 'data-k': key, onchange: (e) => onChange(e.target.value) },
      options.map((o) => h('option', { value: String(o.value) }, o.label))));
}
