// PIN rhythm: the timed schedule the metronome plays. Pure: no DOM, no audio, no clock.
// The driver reads the PIN as power pulses on the tail switch (Lux-RC 371/372 v2 manual):
//   - on-time of a click: at least 64 ms and under 500 ms (about 200 ms is ideal);
//   - off-time between clicks of one digit: keep it at or under 300 ms (500 ms or more is a digit gap);
//   - off-time between digits: 500–1250 ms (about 1 s); longer wipes the digits entered so far;
//   - after the last digit wait about 1 s, then switch on and leave it on: programming mode.
import { isValidPin } from '../core/index.js';

/** Count-in before the first pulse: three beats, one per second. */
export const COUNT_IN_BEATS = 3;
export const COUNT_IN_INTERVAL_MS = 1000;

/** Timing per speed. Every value sits well inside the manual limits above. */
export const SPEEDS = Object.freeze({
  normal: Object.freeze({ onMs: 200, clickGapMs: 250, digitGapMs: 1000, finalWaitMs: 1000 }),
  slow: Object.freeze({ onMs: 300, clickGapMs: 300, digitGapMs: 1150, finalWaitMs: 1000 }),
});

/** The limits themselves, so tests and callers can check a schedule against the manual. */
export const LIMITS = Object.freeze({
  minOnMs: 64, maxOnMs: 499, maxClickGapMs: 300, minDigitGapMs: 500, maxDigitGapMs: 1250,
});

/** "222" or "2 2 2" to [2, 2, 2]; null when it is not a valid PIN. */
export function parsePin(text) {
  const clean = String(text ?? '').replace(/[\s·.-]/g, '');
  if (!/^\d{3}$/.test(clean)) return null;
  const digits = [...clean].map(Number);
  return isValidPin(digits) ? digits : null;
}

/**
 * Builds the schedule for one PIN entry.
 * Events, sorted by atMs (milliseconds from the start of the count-in):
 *   { kind: 'count', atMs, beat }            beat = 3, 2, 1
 *   { kind: 'on', atMs, durationMs, digit, click, clicks, digits }   light must turn on
 *   { kind: 'off', atMs, digit, click }                               light must turn off
 *   { kind: 'wait', atMs, durationMs }       the pause after the last digit
 *   { kind: 'final', atMs }                  switch on and leave it on
 * digit and click are 1-based; clicks is the number of clicks in that digit.
 * @param {number[]} digits
 * @param {'normal'|'slow'} speed
 * @returns {{ events: object[], totalMs: number, finalAtMs: number }}
 */
export function buildPinSchedule(digits, speed = 'normal') {
  if (!isValidPin(digits)) throw new RangeError(`Invalid PIN: ${JSON.stringify(digits)}`);
  const t = SPEEDS[speed];
  if (!t) throw new RangeError(`Unknown speed: ${speed}`);

  const events = [];
  for (let i = 0; i < COUNT_IN_BEATS; i++) {
    events.push({ kind: 'count', atMs: i * COUNT_IN_INTERVAL_MS, beat: COUNT_IN_BEATS - i });
  }
  let at = COUNT_IN_BEATS * COUNT_IN_INTERVAL_MS;
  digits.forEach((clicks, d) => {
    if (d > 0) at += t.digitGapMs - t.clickGapMs; // the last click already added a click gap
    for (let c = 1; c <= clicks; c++) {
      events.push({ kind: 'on', atMs: at, durationMs: t.onMs, digit: d + 1, click: c, clicks, digits: digits.length });
      events.push({ kind: 'off', atMs: at + t.onMs, digit: d + 1, click: c });
      at += t.onMs + t.clickGapMs;
    }
  });
  const lastOff = at - t.clickGapMs;
  events.push({ kind: 'wait', atMs: lastOff, durationMs: t.finalWaitMs });
  const finalAtMs = lastOff + t.finalWaitMs;
  events.push({ kind: 'final', atMs: finalAtMs });
  return { events, totalMs: finalAtMs, finalAtMs };
}

/**
 * How late an event may be shown before the run must stop. Beyond this a late timer could show an
 * 'on' and its 'off' in the same tick (the click never shows) or stretch a gap past the manual
 * limits, which would teach the user a wrong PIN.
 */
export const MAX_LATE_MS = 150;

/** True when event, due at event.atMs, is applied at nowMs too late to keep the rhythm. */
export function isTooLate(event, nowMs) {
  const limit = event.kind === 'on' ? Math.min(MAX_LATE_MS, event.durationMs) : MAX_LATE_MS;
  return nowMs - event.atMs > limit;
}
