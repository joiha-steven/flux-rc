// The PIN metronome run (step 3, ending in the HOLD countdown) and the flashing square (step 4)
// with its follow-up views.
// Beeps, flashes and the GIF start all read one clock (beeper.startClock), so they stay in sync.
import { h } from './dom.js';
import { buildPinSchedule, isTooLate, GIF_START_DELAY_MS } from './pin-rhythm.js';
import { switchText, currentPin } from './program-steps.js';
import { rhythmTimeline } from './rhythm-timeline.js';
import { t } from './i18n.js';

// GIF_START_DELAY_MS lives in pin-rhythm.js now, because the timeline draws it too.
export { GIF_START_DELAY_MS };

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

/** How long after the planned GIF start the plain-timer backstop moves on from HOLD, if the run's clock stalls. */
const GIF_BACKSTOP_MS = 200;

/** Gap between pressing Start and the first count-in beat, so no beep is scheduled in the past. */
const CLOCK_LEAD_MS = 150;

/** Locale keys of the notices shown on the PIN step when a run stops. */
export const NOTICE_INTERRUPTED = 'program.pin.interrupted';
export const NOTICE_SLIPPED = 'program.pin.slipped';

export function runPin(ctx) {
  const { state } = ctx;
  const type = state.switchType;
  const digits = currentPin(state);
  if (!digits) { ctx.go('pin'); return; }
  const { events, finalAtMs } = buildPinSchedule(digits, state.speed);
  const gifAtMs = finalAtMs + GIF_START_DELAY_MS;

  const number = h('span', { class: 'pulse-number mono' });
  const circle = h('div', { class: 'pulse-circle', 'aria-hidden': 'true' }, number);
  const word = h('p', { class: 'pulse-word' }, t('program.run.getReady'));
  const progress = h('p', { class: 'pulse-progress' }, t('program.pinValue', { pin: digits.join(' · ') }));
  const note = h('p', { class: 'hint pulse-note', role: 'status' });
  const timeline = rhythmTimeline({ holdLabel: switchText(type, 'holdLabel'), final: switchText(type, 'final') });
  timeline.show(digits, state.speed);
  const stop = h('button', { type: 'button', class: 'btn', 'data-stop': '', onclick: () => ctx.go('pin') }, t('program.run.stop'));

  ctx.render({
    step: 3,
    title: t(state.sound ? 'program.run.titleBeeps' : 'program.run.titleCircle'),
    body: [h('div', { class: 'pulse-stage' }, circle, word, progress, timeline.el, note), h('div', { class: 'program-buttons' }, stop)],
    focus: '[data-stop]',
    announce: t(state.sound ? 'program.run.announceBeep' : 'program.run.announceFlash', { pin: digits.join(' '), verb: switchText(type, 'verb') }),
  });

  let left = false;
  let handedOff = false;
  const cleanups = []; // timers and frames of this run; all cancelled when the view is left
  let cancel = () => {};
  let unwatch = () => {};
  const abort = (noticeKey) => { if (!left) ctx.go('pin', { notice: t(noticeKey) }); };
  const onHidden = () => { if (document.visibilityState === 'hidden') abort(NOTICE_INTERRUPTED); };
  document.addEventListener('visibilitychange', onHidden);
  ctx.onLeave(() => {
    left = true;
    cancel(); unwatch();
    for (const fn of cleanups) fn();
    document.removeEventListener('visibilitychange', onHidden);
    if (!handedOff) ctx.beeper.stop();
  });

  // Start is a tap too, so audio may resume here; wait for it (briefly) before timing anything.
  const audioReady = state.sound ? ctx.beeper.unlock() : Promise.resolve(false);
  audioReady.then((audioOk) => {
    if (left) return;
    if (state.sound && !audioOk) {
      note.textContent = t('program.run.noSound');
      const heading = circle.closest('.program-panel')?.querySelector('h2');
      if (heading) heading.textContent = t('program.run.titleCircle');
    }
    begin();
  });

  function apply(e, nextEvent) {
    if (e.kind === 'count') {
      circle.className = 'pulse-circle count';
      number.textContent = String(e.beat);
    } else if (e.kind === 'on') {
      circle.className = 'pulse-circle lit';
      number.textContent = '';
      word.textContent = switchText(type, 'action');
      word.classList.remove('waiting');
      progress.textContent = t('program.run.progress', { digit: e.digit, digits: e.digits, click: e.click, clicks: e.clicks });
      try { navigator.vibrate?.(e.durationMs); } catch (error) { console.warn('flux-rc: vibrate failed', error); }
    } else if (e.kind === 'off') {
      // Between clicks of one digit the word stays (250 ms); between digits it reads as a pause.
      const digitEnds = nextEvent?.kind !== 'on' || nextEvent.digit !== e.digit;
      circle.className = digitEnds ? 'pulse-circle pause' : 'pulse-circle';
      if (digitEnds) { word.textContent = t('program.run.wait'); word.classList.add('waiting'); }
    } else if (e.kind === 'wait') {
      circle.className = 'pulse-circle pause';
      word.textContent = t('program.run.wait');
      word.classList.add('waiting');
      progress.textContent = t('program.run.waitHint', { next: switchText(type, 'final') });
    }
  }

  /**
   * The final cue: step 3 holds a solid, emptying ring with "ON · KEEP IT ON" and counts down to the
   * GIF start, then hands over to step 4 exactly at gifAtMs on the run's clock.
   */
  function hold(clock) {
    // From here an audio stop no longer aborts: the light may already be in programming mode, so
    // the backstop below moves on to the flashing at most GIF_BACKSTOP_MS late. A hidden page
    // (onHidden) still aborts, since nobody is holding the light to the screen then.
    unwatch();
    const deadline = performance.now() + Math.max(0, gifAtMs - clock.elapsed());
    const stepped = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    circle.className = 'pulse-circle hold';
    number.textContent = '';
    word.classList.remove('waiting');
    word.classList.add('holding');
    word.textContent = switchText(type, 'hold');
    let shown = -1;
    let totalSteps = 1;
    let frame = 0;
    const countdown = () => {
      const leftMs = Math.max(0, deadline - performance.now());
      // Whole seconds counted from the 2 s breather: the extra 300 ms (GIF_START_DELAY_MS % 1000) is
      // folded into the last second, so 2.3 s reads "2 s" and never flashes "3 s".
      const seconds = Math.max(1, Math.ceil((leftMs - (GIF_START_DELAY_MS % 1000)) / 1000));
      if (shown < 0) totalSteps = seconds;
      if (seconds !== shown) { shown = seconds; progress.textContent = t('program.run.startsIn', { seconds }); }
      // Reduced motion: the fill drops once a second instead of draining smoothly.
      const fraction = stepped ? (leftMs > 0 ? seconds / totalSteps : 0) : leftMs / GIF_START_DELAY_MS;
      circle.style.setProperty('--hold-left', String(Math.max(0, Math.min(1, fraction))));
      if (leftMs > 0) frame = requestAnimationFrame(countdown);
    };
    countdown();
    ctx.announce(t('program.run.announceHold', { cue: switchText(type, 'final'), seconds: Math.round(GIF_START_DELAY_MS / 1000) }));
    let moved = false;
    const toFlashing = () => {
      if (moved || left) return;
      moved = true;
      handedOff = true; // nothing left to silence; keeps the final beep's tail if it is still playing
      ctx.go('program', { from: 'pin', cue: switchText(type, 'final') });
    };
    const cancelClock = waitUntil(clock, gifAtMs, toFlashing);
    const backstop = setTimeout(toFlashing, Math.max(0, deadline - performance.now()) + GIF_BACKSTOP_MS);
    cleanups.push(cancelClock, () => clearTimeout(backstop), () => cancelAnimationFrame(frame));
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
    cleanups.push(timeline.play(clock));
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
        apply(events[next], events[next + 1]);
        next += 1;
      }
      if (now >= finalAtMs) { hold(clock); return; }
      cancel = waitUntil(clock, events[next].atMs, tick);
    }
    tick();
  }
}

/** Step 4. The GIF starts at frame 0 as soon as the step mounts: the PIN run calls it at the planned time. */
export function programStep(ctx, options = {}) {
  const { cue } = options;
  const img = h('img', { class: 'flash-img', alt: '' });
  const hint = h('p', { class: 'flash-hint' }, t('program.flash.hint'));
  const buttons = h('div', { class: 'program-buttons' });
  ctx.state.method = options.from === 'tailcap' ? 'tailcap' : 'pin';
  const tryAgain = () => ctx.go(ctx.state.method);
  const btn = (label, onclick, extra = {}) => h('button', { type: 'button', class: 'btn', onclick, ...extra }, label);

  function waiting() {
    buttons.replaceChildren(
      btn(t('program.flash.seen'), confirmed, { 'data-seen': '' }),
      btn(t('program.flash.tryAgain'), tryAgain),
      btn(t('common.back'), tryAgain));
  }
  function confirmed() {
    hint.textContent = t('program.flash.keepHolding');
    buttons.replaceChildren(
      btn(t('program.flash.wentOff'), () => ctx.go('success'), { 'data-done': '' }),
      btn(t('program.flash.stillRed'), () => ctx.go('stillRed')));
    ctx.announce(hint.textContent);
    buttons.querySelector('[data-done]').focus();
  }
  waiting();

  ctx.render({
    step: 4,
    flashing: true,
    body: [h('p', { class: 'flash-cue' }, cue || t('program.flash.cue')), img, hint, buttons],
    focus: '[data-seen]',
    announce: cue ? t('program.flash.announce', { cue, hint: hint.textContent }) : hint.textContent,
  });

  // A fresh blob URL makes the GIF start at frame 0, i.e. at the start of the green lead.
  img.src = ctx.newGifUrl();
  img.alt = t('program.flash.alt');
}

export function successView(ctx) {
  ctx.render({
    step: 4,
    title: t('program.success.title'),
    body: [
      h('p', {}, t('program.success.text')),
      h('div', { class: 'program-buttons' }, h('button', { type: 'button', class: 'btn btn-primary', 'data-close': '', onclick: ctx.close }, t('common.close'))),
    ],
    focus: '[data-close]',
    announce: t('program.success.announce'),
  });
}

export function stillRedView(ctx) {
  ctx.render({
    step: 4,
    title: t('program.stillRed.title'),
    body: [
      h('p', {}, t('program.stillRed.text')),
      h('ul', { class: 'program-list' }, ['brightness', 'closer', 'darker', 'second'].map((tip) => h('li', {}, t(`program.stillRed.${tip}`)))),
      h('div', { class: 'program-buttons' },
        h('button', { type: 'button', class: 'btn btn-primary', 'data-again': '', onclick: () => ctx.go(ctx.state.method || 'pin') }, t('program.stillRed.again')),
        h('button', { type: 'button', class: 'btn', onclick: ctx.close }, t('common.close'))),
    ],
    focus: '[data-again]',
  });
}
