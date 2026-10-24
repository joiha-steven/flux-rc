// The PIN metronome run (step 3) and the flashing square (step 4) with its follow-up views.
// Beeps, flashes and the GIF start all read one clock (beeper.startClock), so they stay in sync.
import { h } from './dom.js';
import { buildPinSchedule, isTooLate } from './pin-rhythm.js';
import { switchText, currentPin } from './program-steps.js';
import { t } from './i18n.js';

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

/** Locale keys of the notices shown on the PIN step when a run stops. */
export const NOTICE_INTERRUPTED = 'program.pin.interrupted';
export const NOTICE_SLIPPED = 'program.pin.slipped';

export function runPin(ctx) {
  const { state } = ctx;
  const type = state.switchType;
  const digits = currentPin(state);
  if (!digits) { ctx.go('pin'); return; }
  const { events, finalAtMs } = buildPinSchedule(digits, state.speed);

  const number = h('span', { class: 'pulse-number mono' });
  const circle = h('div', { class: 'pulse-circle', 'aria-hidden': 'true' }, number);
  const word = h('p', { class: 'pulse-word' }, t('program.run.getReady'));
  const progress = h('p', { class: 'pulse-progress' }, t('program.pinValue', { pin: digits.join(' · ') }));
  const note = h('p', { class: 'hint pulse-note', role: 'status' });
  const stop = h('button', { type: 'button', class: 'btn', 'data-stop': '', onclick: () => ctx.go('pin') }, t('program.run.stop'));

  ctx.render({
    step: 3,
    title: t(state.sound ? 'program.run.titleBeeps' : 'program.run.titleCircle'),
    body: [h('div', { class: 'pulse-stage' }, circle, word, progress, note), h('div', { class: 'program-buttons' }, stop)],
    focus: '[data-stop]',
    announce: t(state.sound ? 'program.run.announceBeep' : 'program.run.announceFlash', { pin: digits.join(' '), verb: switchText(type, 'verb') }),
  });

  let left = false;
  let handedOff = false;
  let cancel = () => {};
  let unwatch = () => {};
  const abort = (noticeKey) => { if (!left) ctx.go('pin', { notice: t(noticeKey) }); };
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
      note.textContent = t('program.run.noSound');
      const heading = circle.closest('.program-panel')?.querySelector('h2');
      if (heading) heading.textContent = t('program.run.titleCircle');
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
      word.textContent = switchText(type, 'action');
      progress.textContent = t('program.run.progress', { digit: e.digit, digits: e.digits, click: e.click, clicks: e.clicks });
      try { navigator.vibrate?.(e.durationMs); } catch (error) { console.warn('flux-rc: vibrate failed', error); }
    } else if (e.kind === 'off') {
      circle.className = 'pulse-circle';
    } else if (e.kind === 'wait') {
      word.textContent = t('program.run.wait');
      progress.textContent = t('program.run.waitHint');
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
        ctx.go('program', { from: 'pin', clock, gifAtMs: finalAtMs + GIF_START_DELAY_MS, cue: switchText(type, 'final') });
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
  const startGif = () => {
    img.src = ctx.newGifUrl();
    img.alt = t('program.flash.alt');
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
