// Program screen steps before the run: 1 Switch, 2 Get ready, 3 Enter PIN (setup), and the
// tailcap fallback. Each view gets the screen context from program-screen.js (see makeContext there).
import { h } from './dom.js';
import { segmented, switchRow } from './controls.js';
import { icon } from './icons.js';
import { writePref } from './storage.js';
import { parsePin } from './pin-rhythm.js';
import { t } from './i18n.js';

export const SWITCH_KEY = 'flux-rc:switch';
export const SOUND_KEY = 'flux-rc:sound';

/**
 * The two switch types. The light sees the same signal; only the words differ. `press`: each click
 * is a press (McClicky) rather than a release (MOFF).
 */
export const SWITCHES = {
  mcclicky: { press: true },
  moff: { press: false },
};

/**
 * A switch type's words, from the locale ("program.switch.<type>.<part>"): name, desc, rest (tip in
 * Get ready), action (PRESS / RELEASE on the circle), verb (the same in a sentence), final (step 4 cue).
 */
export const switchText = (type, part) => t(`program.switch.${type}.${part}`);

const PRESET_PINS = { 222: [2, 2, 2], 112: [1, 1, 2] };

/** Digits of the PIN chosen in state, or null when the custom PIN is not valid. */
export function currentPin(state) {
  return state.pinChoice === 'custom' ? parsePin(state.customPin) : PRESET_PINS[state.pinChoice];
}

// Line drawings, 64 × 48. A tailcap seen from the side with its button on top.
const DRAWINGS = {
  mcclicky: '<path d="M14 44h36M18 44V26h28v18"/><path d="M20 26c0-12 5-17 12-17s12 5 12 17"/><path d="M26 18c2-3 4-4 6-4"/>',
  moff: '<path d="M14 44h36M18 44V26h28v18"/><rect x="22" y="19" width="20" height="7" rx="1.5"/><path d="M26 22.5h12"/>',
};
function drawing(type) {
  const span = document.createElement('span');
  span.className = 'switch-drawing';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 64 48" width="64" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${DRAWINGS[type]}</svg>`;
  return span;
}

const backButton = (ctx, to) => h('button', { type: 'button', class: 'btn', onclick: () => ctx.go(to) }, t('common.back'));

export function switchStep(ctx) {
  const { state } = ctx;
  const next = h('button', { type: 'button', class: 'btn btn-primary', disabled: !state.switchType, 'data-next': '', onclick: () => ctx.go('ready') }, t('program.switch.next'));
  ctx.render({
    step: 1,
    title: t('program.switch.title'),
    body: [
      segmented({
        key: 'prog-switch', label: t('program.switch.label'), hideLabel: true, variant: 'cards', value: state.switchType,
        options: Object.keys(SWITCHES).map((value) => ({
          value,
          label: h('span', { class: 'switch-card' }, drawing(value),
            h('span', { class: 'switch-card-text' }, h('span', {}, switchText(value, 'name')), h('span', { class: 'opt-desc' }, switchText(value, 'desc')))),
        })),
        onChange: (v) => { state.switchType = v; writePref(SWITCH_KEY, v); next.disabled = false; },
      }),
      h('div', { class: 'program-buttons' }, next, h('button', { type: 'button', class: 'btn', onclick: ctx.close }, t('common.cancel'))),
    ],
    focus: state.switchType ? '[data-next]' : 'input',
  });
}

export function readyStep(ctx) {
  const tips = [
    ['sun', t('program.ready.brightness')],
    ['moon', t('program.ready.dark')],
    ['closer', t('program.ready.close')],
    ['power', switchText(ctx.state.switchType, 'rest')],
  ];
  ctx.render({
    step: 2,
    title: t('program.ready.title'),
    body: [
      h('ul', { class: 'program-tips' }, tips.map(([name, text]) => h('li', {}, icon(name, 18), h('span', {}, text)))),
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn btn-primary', 'data-ready': '', onclick: () => { ctx.ready(); ctx.go('pin'); } }, t('program.ready.button')),
        backButton(ctx, 'switch')),
    ],
    focus: '[data-ready]',
  });
}

/** options.notice: why the last run stopped (shown at the top). */
export function pinStep(ctx, options = {}) {
  const { state } = ctx;
  const press = SWITCHES[state.switchType].press;
  const display = h('p', { class: 'pin-digits mono', 'aria-live': 'off' });
  const error = h('p', { class: 'hint pin-error', role: 'alert' });
  const start = h('button', { type: 'button', class: 'btn btn-primary', 'data-start': '', onclick: () => ctx.go('run') }, t('program.pin.start'));
  const custom = h('input', {
    type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: 5, class: 'pin-input mono',
    'aria-label': t('program.pin.customField'), placeholder: t('program.pin.customPlaceholder', { pin: 314 }), value: state.customPin,
    oninput: (e) => { state.customPin = e.target.value; update(); },
  });
  const customRow = h('div', { class: 'pin-custom' }, custom, error);

  function update() {
    const digits = currentPin(state);
    display.textContent = digits ? digits.join(' · ') : '– · – · –';
    display.setAttribute('aria-label', digits ? t('program.pinValue', { pin: digits.join(' ') }) : t('program.pin.none'));
    customRow.hidden = state.pinChoice !== 'custom';
    const typed = state.customPin.trim() !== '';
    error.textContent = state.pinChoice === 'custom' && typed && !digits
      ? t('program.pin.customError') : '';
    start.disabled = !digits;
  }

  ctx.render({
    step: 3,
    title: t('program.pin.title'),
    body: [
      options.notice && h('p', { class: 'program-notice', role: 'alert' }, options.notice),
      h('p', { class: 'hint' }, t(press ? 'program.pin.hintPress' : 'program.pin.hintRelease')),
      display,
      segmented({
        key: 'prog-pin', label: t('program.pin.label'), value: state.pinChoice,
        options: [{ value: '222', label: '222' }, { value: '112', label: '112' }, { value: 'custom', label: t('program.pin.custom') }],
        onChange: (v) => { state.pinChoice = v; update(); if (v === 'custom') custom.focus(); },
      }),
      customRow,
      h('p', { class: 'hint' }, t('program.pin.oldPin')),
      segmented({
        key: 'prog-speed', label: t('program.pin.speed'), value: state.speed,
        options: [{ value: 'normal', label: t('program.pin.speedNormal') }, { value: 'slow', label: t('program.pin.speedSlow') }],
        onChange: (v) => { state.speed = v; },
      }),
      switchRow({
        key: 'prog-sound', label: t('program.pin.sound'), aria: t('program.pin.sound'), checked: state.sound,
        desc: t('program.pin.soundHint'),
        onChange: (on) => { state.sound = on; writePref(SOUND_KEY, on ? '1' : '0'); if (on) ctx.beeper.unlock(); },
      }),
      h('p', { class: 'hint' }, t('program.pin.reverseClicky')),
      h('div', { class: 'program-buttons' }, start, backButton(ctx, 'ready')),
      h('button', { type: 'button', class: 'link-button', onclick: () => ctx.go('tailcap') }, t('program.pin.tailcapLink')),
    ],
    focus: '[data-start]',
    announce: options.notice,
  });
  update();
}

export function tailcapStep(ctx) {
  ctx.render({
    step: 3,
    title: t('program.tailcap.title'),
    body: [
      h('p', { class: 'hint' }, t('program.tailcap.hint')),
      h('ol', {}, [1, 2, 3, 4].map((n) => h('li', {}, t(`program.tailcap.step${n}`)))),
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn btn-primary btn-big', 'data-red': '', onclick: () => { ctx.ready(); ctx.go('program', { from: 'tailcap' }); } }, t('program.tailcap.button')),
        backButton(ctx, 'pin')),
    ],
    focus: '[data-red]',
  });
}
