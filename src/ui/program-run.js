// The PIN metronome run (step 3) and the flashing square (step 4) with its follow-up views.
// Beeps, flashes and the GIF start all read one clock (beeper.startClock), so they stay in sync.
import { h } from './dom.js';
import { buildPinSchedule, isTooLate } from './pin-rhythm.js';
import { SWITCHES, currentPin } from './program-steps.js';

/**
 * Delay from the final "switch on" cue to the GIF starting at frame 0. The signal opens with 3 s of
 * green lead, so starting a little late costs nothing, while starting early would waste lead on a
 * light that is still switching on: people need a moment to react to the cue, and the driver needs
 * a moment to boot into programming mode.
 */
export const GIF_START_DELAY_MS = 300;

/**
 * Calls fn once clock.elapsed() reaches atMs. A timer rather than animation frames, because frames
 * stop while the page is hidden; the timer re-arms itself if it fires early. Always async. Returns a cancel function.
 */
function waitUntil(clock, atMs, fn) {
  const check = () => {
    const left = atMs - clock.elapsed();
    if (left <= 0) fn();
    else id = setTimeout(check, left);
  };
  let id = setTimeout(check, Math.max(0, atMs - clock.elapsed()));
  return () => clearTimeout(id);
}

/** How long after the planned GIF start the plain-timer backstop fires. */
const GIF_BACKSTOP_MS = 200;

/** Gap between pressing Start and the first count-in beat, so no beep is scheduled in the past. */
const CLOCK_LEAD_MS = 150;

export const NOTICE_INTERRUPTED = 'Interrupted. Start again when you\'re ready.';
export const NOTICE_SLIPPED = 'Timing slipped. Start again.';

export function runPin(ctx) {
  const { state } = ctx;
  const s = SWITCHES[state.switchType];
  const digits = currentPin(state);
  if (!digits) { ctx.go('pin'); return; }
  const { events, finalAtMs } = buildPinSchedule(digits, state.speed);

  const number = h('span', { class: 'pulse-number mono' });
  const circle = h('div', { class: 'pulse-circle', 'aria-hidden': 'true' }, number);
  const word = h('p', { class: 'pulse-word' }, 'Get ready');
  const progress = h('p', { class: 'pulse-progress' }, `PIN ${digits.join(' · ')}`);
  const note = h('p', { class: 'hint pulse-note', role: 'status' });
  const stop = h('button', { type: 'button', class: 'btn', 'data-stop': '', onclick: () => ctx.go('pin') }, 'Stop');

  ctx.render({
    step: 3,
    title: state.sound ? 'Follow the beeps' : 'Follow the circle',
    body: [h('div', { class: 'pulse-stage' }, circle, word, progress, note), h('div', { class: 'program-buttons' }, stop)],
    focus: '[data-stop]',
    announce: `Entering PIN ${digits.join(' ')}. Count-in, then ${s.action.toLowerCase()} at each ${state.sound ? 'beep' : 'flash'}.`,
  });

  let left = false;
  let handedOff = false;
  let cancel = () => {};
  let unwatch = () => {};
  const abort = (notice) => { if (!left) ctx.go('pin', { notice }); };
  const onHidden = () => { if (document.visibilityState === 'hidden') abort(NOTICE_INTERRUPTED); };
  document.addEventListener('visibilitychange', onHidden);
  ctx.onLeave(() => {
    left = true;
    cancel(); unwatch();
    document.removeEventListener('visibilitychange', onHidden);
    if (!handedOff) ctx.beeper.stop();
  });

  // Start is a tap too, so audio may resume here; wait for it (briefly) before timing anything.
  const audioReady = state.sound ? ctx.beeper.unlock() : Promise.resolve(false);
  audioReady.then((audioOk) => {
    if (left) return;
    if (state.sound && !audioOk) {
      note.textContent = 'Sound isn\'t available. Follow the circle instead.';
      const heading = circle.closest('.program-panel')?.querySelector('h2');
      if (heading) heading.textContent = 'Follow the circle';
    }
    begin();
  });

  function apply(e) {
    if (e.kind === 'count') {
      circle.className = 'pulse-circle count';
      number.textContent = String(e.beat);
    } else if (e.kind === 'on') {
      circle.className = 'pulse-circle lit';
      number.textContent = '';
      word.textContent = s.action;
      progress.textContent = `Digit ${e.digit} of ${e.digits} · click ${e.click} of ${e.clicks}`;
      try { navigator.vibrate?.(e.durationMs); } catch (error) { console.warn('flux-rc: vibrate failed', error); }
    } else if (e.kind === 'off') {
      circle.className = 'pulse-circle';
    } else if (e.kind === 'wait') {
      word.textContent = 'Wait';
      progress.textContent = 'PIN entered. Wait one second.';
    }
  }

  function begin() {
    const clock = ctx.beeper.startClock({ sound: state.sound, leadMs: CLOCK_LEAD_MS });
    for (const e of events) {
      if (e.kind === 'count') clock.beep('count', e.atMs);
      else if (e.kind === 'on') clock.beep('pulse', e.atMs);
      else if (e.kind === 'final') clock.beep('final', e.atMs);
    }
    // A stopped audio clock would freeze the run on a lit circle; stop instead.
    unwatch = clock.onInterrupt(() => abort(NOTICE_INTERRUPTED));
    let next = 0;
    function tick() {
      if (left) return;
      const now = clock.elapsed();
      while (next < events.length && events[next].atMs <= now && events[next].kind !== 'final') {
        if (isTooLate(events[next], now)) {
          console.warn(`flux-rc: PIN run stopped, ${events[next].kind} event ${Math.round(now - events[next].atMs)} ms late`);
          abort(NOTICE_SLIPPED);
          return;
        }
        apply(events[next++]);
      }
      if (now >= finalAtMs) {
        handedOff = true; // keep the long final beep playing into step 4
        ctx.go('program', { from: 'pin', clock, gifAtMs: finalAtMs + GIF_START_DELAY_MS, cue: s.final });
        return;
      }
      cancel = waitUntil(clock, events[next].atMs, tick);
    }
    tick();
  }
}

/** Step 4. options.clock + options.gifAtMs start the GIF on the run's clock; without them it starts now. */
export function programStep(ctx, options = {}) {
  const { clock, gifAtMs, cue } = options;
  const img = h('img', { class: 'flash-img', alt: '' });
  const hint = h('p', { class: 'flash-hint' }, 'Dim red light? Keep holding the light on the square.');
  const buttons = h('div', { class: 'program-buttons' });
  ctx.state.method = options.from === 'tailcap' ? 'tailcap' : 'pin';
  const tryAgain = () => ctx.go(ctx.state.method);
  const btn = (label, onclick, extra = {}) => h('button', { type: 'button', class: 'btn', onclick, ...extra }, label);

  function waiting() {
    buttons.replaceChildren(
      btn('I see the red light', confirmed, { 'data-seen': '' }),
      btn('No red light, try again', tryAgain),
      btn('Back', tryAgain));
  }
  function confirmed() {
    hint.textContent = 'Keep holding until the red light goes off (10–20 s).';
    buttons.replaceChildren(
      btn('It went off: done', () => ctx.go('success'), { 'data-done': '' }),
      btn('Still red', () => ctx.go('stillRed')));
    ctx.announce(hint.textContent);
    buttons.querySelector('[data-done]').focus();
  }
  waiting();

  ctx.render({
    step: 4,
    flashing: true,
    body: [h('p', { class: 'flash-cue' }, cue || 'Programming'), img, hint, buttons],
    focus: '[data-seen]',
    announce: cue ? `${cue}. ${hint.textContent}` : hint.textContent,
  });

  // A fresh blob URL makes the GIF start at frame 0, i.e. at the start of the green lead.
  const startGif = () => {
    img.src = ctx.newGifUrl();
    img.alt = 'Flashing square that programs the light';
  };
  if (!clock) { startGif(); return; }
  // Normally the run's clock starts the GIF. If that clock stops (audio suspended right after the
  // cue) a plain timer starts it anyway, slightly late, rather than leaving the square black.
  let started = false;
  const startOnce = () => { if (!started) { started = true; startGif(); } };
  const cancelClock = waitUntil(clock, gifAtMs, startOnce);
  const backstop = setTimeout(startOnce, Math.max(0, gifAtMs - clock.elapsed()) + GIF_BACKSTOP_MS);
  ctx.onLeave(() => { cancelClock(); clearTimeout(backstop); });
}

export function successView(ctx) {
  ctx.render({
    step: 4,
    title: 'Programmed',
    body: [
      h('p', {}, 'Programmed. Switch the light off and on to try your modes.'),
      h('div', { class: 'program-buttons' }, h('button', { type: 'button', class: 'btn btn-primary', 'data-close': '', onclick: ctx.close }, 'Close')),
    ],
    focus: '[data-close]',
    announce: 'Programmed.',
  });
}

export function stillRedView(ctx) {
  ctx.render({
    step: 4,
    title: 'Still red?',
    body: [
      h('p', {}, 'The light did not read the whole signal. Try again:'),
      h('ul', { class: 'program-list' },
        h('li', {}, 'Set the screen brightness to maximum.'),
        h('li', {}, 'Hold the light closer, right against the square.'),
        h('li', {}, 'Make the room darker.'),
        h('li', {}, 'A second attempt is sometimes needed.')),
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn btn-primary', 'data-again': '', onclick: () => ctx.go(ctx.state.method || 'pin') }, 'Try again'),
        h('button', { type: 'button', class: 'btn', onclick: ctx.close }, 'Close')),
    ],
    focus: '[data-again]',
  });
}
