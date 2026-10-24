// Full-screen programming overlay: the shell. It opens and closes, holds the wake lock, owns the GIF blob URL and the beeper, and switches between the step views in
// program-steps.js (1 Switch, 2 Get ready, 3 Enter PIN, tailcap) and program-run.js (the PIN run,
// 4 Program, success, still red). See docs/design.md, "Program screen".
import { h } from './dom.js';
import { hideToasts } from './toast.js';
import { readPref } from './storage.js';
import { createBeeper } from './beeper.js';
import { SWITCHES, SWITCH_KEY, SOUND_KEY, switchStep, readyStep, pinStep, tailcapStep } from './program-steps.js';
import { runPin, programStep, successView, stillRedView } from './program-run.js';
import { t } from './i18n.js';

const STEP_KEYS = ['program.step.switch', 'program.step.ready', 'program.step.pin', 'program.step.program'];
const VIEWS = {
  switch: switchStep, ready: readyStep, pin: pinStep, tailcap: tailcapStep,
  run: runPin, program: programStep, success: successView, stillRed: stillRedView,
};

export function createProgramScreen(root, appRoot) {
  let gifBytes = null;
  let url = null;
  let wakeLock = null;
  let wantWakeLock = false;
  let opener = null;
  let epoch = 0; // bumped on every open and close, so a request that resolves late knows it is stale
  let leave = []; // cleanups of the current view (timers, animation frames, scheduled beeps)
  const stage = h('div', { class: 'program-stage' });
  const live = h('p', { class: 'sr', 'aria-live': 'polite' });
  const beeper = createBeeper();

  const storedSwitch = readPref(SWITCH_KEY, null);
  // Kept while the page is open, so a second Program run starts where the last one ended.
  const state = {
    switchType: SWITCHES[storedSwitch] ? storedSwitch : null,
    pinChoice: '222',
    customPin: '',
    speed: 'normal',
    sound: readPref(SOUND_KEY, '1') !== '0',
    method: 'pin',
  };

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
      if (!navigator.wakeLock?.request || wakeLock) return;
      const lock = await navigator.wakeLock.request('screen');
      if (mine !== epoch) { Promise.resolve(lock.release?.()).catch((e) => console.warn('flux-rc: wake lock release failed', e)); return; } // closed while waiting
      wakeLock = lock;
      lock.addEventListener?.('release', () => { if (wakeLock === lock) wakeLock = null; });
    } catch (error) { console.warn('flux-rc: wake lock refused', error); }
  }
  function release() {
    wantWakeLock = false;
    try { wakeLock?.release?.(); } catch (error) { console.warn('flux-rc: wake lock release failed', error); }
    wakeLock = null;
  }
  function runLeave() {
    const fns = leave; leave = [];
    for (const fn of fns) {
      try { fn(); } catch (error) { console.error('flux-rc: program view cleanup failed', error); }
    }
  }
  function close() {
    epoch += 1;
    runLeave();
    beeper.stop();
    release();
    revoke();
    root.hidden = true;
    root.classList.remove('flashing', 'prepare');
    root.replaceChildren();
    appRoot.inert = false;
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisible);
    opener?.focus?.();
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const items = [...root.querySelectorAll('button, input, [tabindex]')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0]; const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  const onVisible = () => { if (document.visibilityState === 'visible' && wantWakeLock && !wakeLock) acquireWakeLock(); };

  function stepIndicator(current) {
    return h('ol', { class: 'program-progress', 'aria-label': t('program.steps') }, STEP_KEYS.map((key, i) =>
      h('li', { class: i + 1 < current ? 'done' : '', 'aria-current': i + 1 === current ? 'step' : null },
        h('span', { class: 'step-num mono' }, i + 1), h('span', { class: 'step-label' }, t(key)))));
  }

  /** What every view calls. */
  const ctx = {
    state,
    beeper,
    close,
    newGifUrl: newUrl,
    go(name, options) {
      runLeave();
      VIEWS[name](ctx, options);
    },
    /** The tap on "I'm ready" (or the tailcap button): browsers allow these only from a gesture. */
    ready() {
      wantWakeLock = true;
      acquireWakeLock();
      if (state.sound) beeper.unlock();
    },
    onLeave(fn) { leave.push(fn); },
    announce(text) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = text; }); },
    /** { step, title?, body, focus?, flashing?, announce? }. Prepare views sit in a card on the dotted background. */
    render({ step, title, body, focus, flashing = false, announce }) {
      root.classList.toggle('flashing', flashing);
      root.classList.toggle('prepare', !flashing);
      const heading = title && h('h2', { tabindex: '-1' }, title);
      stage.replaceChildren(h('div', { class: 'program-inner' },
        stepIndicator(step),
        flashing ? body : h('div', { class: 'program-panel' }, heading, body)));
      ctx.announce(announce || t('program.stepAnnounce', { step, total: STEP_KEYS.length, title: title || t(STEP_KEYS[step - 1]) }));
      (focus && stage.querySelector(focus) || heading || stage.querySelector('button'))?.focus({ preventScroll: true });
    },
  };

  return {
    open(program) {
      epoch += 1;
      gifBytes = program.gif;
      opener = document.activeElement;
      hideToasts();
      appRoot.inert = true;
      root.hidden = false;
      root.replaceChildren(stage, live);
      document.addEventListener('keydown', onKey);
      document.addEventListener('visibilitychange', onVisible);
      ctx.go('switch');
    },
  };
}
