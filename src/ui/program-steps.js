// Program screen steps before the run: 1 Switch, 2 Get ready, 3 Enter PIN (setup), and the
// tailcap fallback. Each view gets the screen context from program-screen.js (see makeContext there).
import { h } from './dom.js';
import { segmented, switchRow } from './controls.js';
import { icon } from './icons.js';
import { writePref } from './storage.js';
import { parsePin } from './pin-rhythm.js';

export const SWITCH_KEY = 'flux-rc:switch';
export const SOUND_KEY = 'flux-rc:sound';

/** The two switch types. The light sees the same signal; only the words differ. */
export const SWITCHES = {
  mcclicky: {
    name: 'Mechanical (McClicky)',
    desc: 'Rubber cap. Each click is a quick half-press.',
    rest: 'Light off: nothing pressed.',
    action: 'PRESS',
    final: 'Switch on and leave it on',
  },
  moff: {
    name: 'E-switch (MOFF)',
    desc: 'Flat metal button that cuts the power while pressed.',
    rest: 'Hold the button down so the light is off.',
    action: 'RELEASE',
    final: 'Release and leave it',
  },
};

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

const backButton = (ctx, to) => h('button', { type: 'button', class: 'btn', onclick: () => ctx.go(to) }, 'Back');

export function switchStep(ctx) {
  const { state } = ctx;
  const next = h('button', { type: 'button', class: 'btn btn-primary', disabled: !state.switchType, 'data-next': '', onclick: () => ctx.go('ready') }, 'Next');
  ctx.render({
    step: 1,
    title: 'Which switch does your light have?',
    body: [
      segmented({
        key: 'prog-switch', label: 'Switch type', hideLabel: true, variant: 'cards', value: state.switchType,
        options: Object.entries(SWITCHES).map(([value, s]) => ({
          value,
          label: h('span', { class: 'switch-card' }, drawing(value),
            h('span', { class: 'switch-card-text' }, h('span', {}, s.name), h('span', { class: 'opt-desc' }, s.desc))),
        })),
        onChange: (v) => { state.switchType = v; writePref(SWITCH_KEY, v); next.disabled = false; },
      }),
      h('div', { class: 'program-buttons' }, next, h('button', { type: 'button', class: 'btn', onclick: ctx.close }, 'Cancel')),
    ],
    focus: state.switchType ? '[data-next]' : 'input',
  });
}

export function readyStep(ctx) {
  const s = SWITCHES[ctx.state.switchType];
  const tips = [
    ['sun', 'Set the screen brightness to maximum.'],
    ['moon', 'Find a dark room: daylight or bright room light can overexpose the sensor.'],
    ['closer', 'Hold the light right against the screen.'],
    ['power', s.rest],
  ];
  ctx.render({
    step: 2,
    title: 'Get ready',
    body: [
      h('ul', { class: 'program-tips' }, tips.map(([name, text]) => h('li', {}, icon(name, 18), h('span', {}, text)))),
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn btn-primary', 'data-ready': '', onclick: () => { ctx.ready(); ctx.go('pin'); } }, 'I\'m ready'),
        backButton(ctx, 'switch')),
    ],
    focus: '[data-ready]',
  });
}

/** options.notice: why the last run stopped (shown at the top). */
export function pinStep(ctx, options = {}) {
  const { state } = ctx;
  const s = SWITCHES[state.switchType];
  const display = h('p', { class: 'pin-digits mono', 'aria-live': 'off' });
  const error = h('p', { class: 'hint pin-error', role: 'alert' });
  const start = h('button', { type: 'button', class: 'btn btn-primary', 'data-start': '', onclick: () => ctx.go('run') }, 'Start');
  const custom = h('input', {
    type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: 5, class: 'pin-input mono',
    'aria-label': 'Custom PIN, three digits', placeholder: 'e.g. 314', value: state.customPin,
    oninput: (e) => { state.customPin = e.target.value; update(); },
  });
  const customRow = h('div', { class: 'pin-custom' }, custom, error);

  function update() {
    const digits = currentPin(state);
    display.textContent = digits ? digits.join(' · ') : '– · – · –';
    display.setAttribute('aria-label', digits ? `PIN ${digits.join(' ')}` : 'No valid PIN yet');
    customRow.hidden = state.pinChoice !== 'custom';
    const typed = state.customPin.trim() !== '';
    error.textContent = state.pinChoice === 'custom' && typed && !digits
      ? 'Use three digits: the first 1–4, the others 1–8 (4-8-8 is not allowed).' : '';
    start.disabled = !digits;
  }

  ctx.render({
    step: 3,
    title: 'Enter the PIN',
    body: [
      options.notice && h('p', { class: 'program-notice', role: 'alert' }, options.notice),
      h('p', { class: 'hint' }, `Follow the beeps, not the light: it may not flash while you click. At each beep, ${s.action === 'PRESS' ? 'half-press the cap' : 'release the button and press it again'}.`),
      display,
      segmented({
        key: 'prog-pin', label: 'PIN', value: state.pinChoice,
        options: [{ value: '222', label: '222' }, { value: '112', label: '112' }, { value: 'custom', label: 'Custom' }],
        onChange: (v) => { state.pinChoice = v; update(); if (v === 'custom') custom.focus(); },
      }),
      customRow,
      h('p', { class: 'hint' }, 'If you just changed the PIN in Advanced, the light still uses its old PIN until this programming finishes.'),
      segmented({
        key: 'prog-speed', label: 'Speed', value: state.speed,
        options: [{ value: 'normal', label: 'Normal' }, { value: 'slow', label: 'Slow' }],
        onChange: (v) => { state.speed = v; },
      }),
      switchRow({
        key: 'prog-sound', label: 'Sound', aria: 'Sound', checked: state.sound,
        desc: 'Beeps mark each click. On iPhone, turn off silent mode.',
        onChange: (on) => { state.sound = on; writePref(SOUND_KEY, on ? '1' : '0'); if (on) ctx.beeper.unlock(); },
      }),
      h('p', { class: 'hint' }, 'Reverse clicky with no half-press? Choose Slow and click fully on, then off, at each beep.'),
      h('div', { class: 'program-buttons' }, start, backButton(ctx, 'ready')),
      h('button', { type: 'button', class: 'link-button', onclick: () => ctx.go('tailcap') }, 'PIN not working? Try the tailcap method'),
    ],
    focus: '[data-start]',
    announce: options.notice,
  });
  update();
}

export function tailcapStep(ctx) {
  ctx.render({
    step: 3,
    title: 'Tailcap method',
    body: [
      h('p', { class: 'hint' }, 'For lights with an electronic button on the driver, where the battery stays connected.'),
      h('ol', {},
        h('li', {}, 'Unscrew the tailcap a little to disconnect the battery, and wait a few seconds.'),
        h('li', {}, 'Press and hold the button.'),
        h('li', {}, 'Keep holding while you screw the tailcap back on.'),
        h('li', {}, 'A dim red light means programming mode. Hold the light against the screen and tap below.')),
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn btn-primary btn-big', 'data-red': '', onclick: () => { ctx.ready(); ctx.go('program', { from: 'tailcap' }); } }, 'Dim red light is on'),
        backButton(ctx, 'pin')),
    ],
    focus: '[data-red]',
  });
}
