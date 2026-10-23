// Full-screen programming overlay: Prepare step, then the flashing GIF.
import { h } from './dom.js';
import { segmented } from './controls.js';
import { icon } from './icons.js';
import { hideToasts } from './toast.js';

// Plain tips, not controls: nothing here can be ticked.
const TIPS = [
  ['sun', 'Set the screen brightness to maximum.'],
  ['moon', 'Find a dark place: daylight or bright room light can overexpose the sensor.'],
  ['closer', 'Hold the light as close to the square as possible.'],
];
const STEPS = {
  electronic: [
    'Disconnect the battery and wait a moment so the driver resets.',
    'Press and hold the button while you reconnect the battery.',
    'Don\'t release it: programming mode starts in about three seconds.',
  ],
  clicky: [
    'Enter the PIN as short clicks with a one-second gap between digits. The public PIN is 222; use the one from your vendor if you have it.',
    'After the last digit, wait one second, then switch the light on.',
    'A dim red light means the PIN was accepted.',
  ],
};
const AFTER_STEPS = 'Programming takes 10–20 seconds and the red light goes off when it\'s done. If it doesn\'t, try again; a second attempt is sometimes needed.';

export function createProgramScreen(root, appRoot) {
  let gifBytes = null;
  let url = null;
  let wakeLock = null;
  let enteredFullscreen = false;
  let opener = null;
  let epoch = 0; // bumped on every open and close, so a request that resolves late knows it is stale
  let kind = 'electronic';

  const revoke = () => { if (url) URL.revokeObjectURL(url); url = null; };
  const newUrl = () => {
    const old = url;
    url = URL.createObjectURL(new Blob([gifBytes], { type: 'image/gif' }));
    if (old) setTimeout(() => URL.revokeObjectURL(old), 1000); // after the <img> has switched over
    return url;
  };

  async function acquireWakeLock() {
    const mine = epoch;
    try {
      if (!navigator.wakeLock?.request) return;
      const lock = await navigator.wakeLock.request('screen');
      if (mine !== epoch) { Promise.resolve(lock.release?.()).catch((e) => console.warn('flux-rc: wake lock release failed', e)); return; } // closed while waiting
      wakeLock = lock;
      lock.addEventListener?.('release', () => { if (wakeLock === lock) wakeLock = null; });
    } catch (error) { console.warn('flux-rc: wake lock refused', error); }
  }
  async function enterFullscreen() {
    const mine = epoch;
    try {
      if (!root.requestFullscreen) return;
      await root.requestFullscreen();
      if (mine !== epoch) { // closed while waiting
        if (document.fullscreenElement) await document.exitFullscreen();
        return;
      }
      enteredFullscreen = true;
    } catch (error) { console.warn('flux-rc: fullscreen refused', error); }
  }
  function release() {
    try { wakeLock?.release?.(); } catch (error) { console.warn('flux-rc: wake lock release failed', error); }
    wakeLock = null;
    if (enteredFullscreen && document.fullscreenElement) document.exitFullscreen?.().catch((e) => console.warn('flux-rc: exit fullscreen failed', e));
    enteredFullscreen = false;
  }
  function close() {
    epoch += 1;
    release();
    revoke();
    root.hidden = true;
    root.classList.remove('flashing', 'prepare');
    root.replaceChildren();
    appRoot.inert = false;
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisible);
    document.removeEventListener('fullscreenchange', onFullscreen);
    opener?.focus?.();
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const items = [...root.querySelectorAll('button, input, [tabindex]')].filter((n) => !n.disabled);
    if (!items.length) return;
    const first = items[0]; const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  const onVisible = () => { if (document.visibilityState === 'visible' && root.classList.contains('flashing') && !wakeLock) acquireWakeLock(); };
  const onFullscreen = () => { if (enteredFullscreen && !document.fullscreenElement) close(); };

  function showPrepare() {
    root.classList.remove('flashing');
    root.classList.add('prepare');
    root.replaceChildren(h('div', { class: 'program-inner' }, h('div', { class: 'program-panel' },
      h('h2', {}, 'Get the light ready'),
      segmented({
        key: 'prog-kind', label: 'Switch type', value: kind,
        options: [{ value: 'electronic', label: 'Electronic switch' }, { value: 'clicky', label: 'Clicky switch' }],
        onChange: (v) => { kind = v; showPrepare(); root.querySelector(`[data-k="prog-kind:${v}"]`)?.focus(); },
      }),
      h('ol', {}, STEPS[kind].map((s) => h('li', {}, s))),
      h('p', { class: 'hint' }, AFTER_STEPS),
      h('div', { class: 'program-tip-group' },
        h('h3', {}, 'Before you start'),
        h('ul', { class: 'program-tips' }, TIPS.map(([name, text]) => h('li', {}, icon(name, 18), h('span', {}, text))))),
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn btn-primary', 'data-start': '', onclick: start }, 'Start'),
        h('button', { type: 'button', class: 'btn', onclick: close }, 'Cancel')))));
    root.querySelector('[data-start]')?.focus();
  }

  async function start() {
    enterFullscreen(); acquireWakeLock();
    const img = h('img', { class: 'flash-img', alt: 'Flashing square that programs the light', src: newUrl() });
    root.classList.remove('prepare');
    root.classList.add('flashing');
    root.replaceChildren(h('div', { class: 'program-inner' },
      h('p', { class: 'flash-hint' }, 'Hold the light against the square. It takes 10–20 seconds; the red light goes off when it is done. If it doesn\'t, press Restart and try again.'),
      img,
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn', onclick: () => { img.src = newUrl(); } }, 'Restart'),
        h('button', { type: 'button', class: 'btn', 'data-done': '', onclick: close }, 'Done'))));
    root.querySelector('[data-done]')?.focus();
  }

  return {
    open(program) {
      epoch += 1;
      gifBytes = program.gif;
      opener = document.activeElement;
      hideToasts();
      appRoot.inert = true;
      root.hidden = false;
      document.addEventListener('keydown', onKey);
      document.addEventListener('visibilitychange', onVisible);
      document.addEventListener('fullscreenchange', onFullscreen);
      showPrepare();
    },
  };
}
