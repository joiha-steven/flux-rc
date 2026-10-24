// The PIN metronome schedule must stay inside the timing limits of the Lux-RC 371/372 v2 manual.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPinSchedule, parsePin, isTooLate, MAX_LATE_MS, LIMITS, SPEEDS } from '../src/ui/pin-rhythm.js';
import { isValidPin } from '../src/core/index.js';

const SPEED_NAMES = Object.keys(SPEEDS);
const PINS = [[2, 2, 2], [1, 1, 2], [3, 7, 5], [4, 8, 7], [1, 1, 1], [4, 1, 8]];

/** Pairs each 'on' with its 'off' and returns on-times, within-digit gaps and digit gaps. */
function measure(events) {
  const ons = events.filter((e) => e.kind === 'on');
  const offs = events.filter((e) => e.kind === 'off');
  assert.equal(ons.length, offs.length);
  const onTimes = ons.map((on, i) => offs[i].atMs - on.atMs);
  const clickGaps = []; const digitGaps = [];
  for (let i = 1; i < ons.length; i++) {
    const gap = ons[i].atMs - offs[i - 1].atMs;
    (ons[i].digit === ons[i - 1].digit ? clickGaps : digitGaps).push(gap);
  }
  return { ons, onTimes, clickGaps, digitGaps };
}

test('222 Normal: exact events and times', () => {
  const { events, finalAtMs } = buildPinSchedule([2, 2, 2], 'normal');
  assert.equal(events.length, 17); // 3 count-in + 6 clicks × on/off + wait + final
  assert.deepEqual(events.map((e) => [e.kind, e.atMs]), [
    ['count', 0], ['count', 1000], ['count', 2000],
    ['on', 3000], ['off', 3200], ['on', 3450], ['off', 3650],
    ['on', 4650], ['off', 4850], ['on', 5100], ['off', 5300],
    ['on', 6300], ['off', 6500], ['on', 6750], ['off', 6950],
    ['wait', 6950], ['final', 7950],
  ]);
  assert.deepEqual(events.slice(0, 3).map((e) => e.beat), [3, 2, 1]);
  assert.equal(finalAtMs, 7950);
  const second = events[5];
  assert.deepEqual([second.digit, second.click, second.clicks, second.digits], [1, 2, 2, 3]);
});

test('events are sorted by time', () => {
  for (const speed of SPEED_NAMES) for (const pin of PINS) {
    const times = buildPinSchedule(pin, speed).events.map((e) => e.atMs);
    assert.deepEqual(times, [...times].sort((a, b) => a - b));
  }
});

test('every on-time is between 64 and 499 ms', () => {
  for (const speed of SPEED_NAMES) for (const pin of PINS) {
    for (const ms of measure(buildPinSchedule(pin, speed).events).onTimes) {
      assert.ok(ms >= LIMITS.minOnMs && ms <= LIMITS.maxOnMs, `${speed} ${pin}: on ${ms} ms`);
    }
  }
});

test('every gap between digits is between 500 and 1250 ms', () => {
  for (const speed of SPEED_NAMES) for (const pin of PINS) {
    const { digitGaps } = measure(buildPinSchedule(pin, speed).events);
    assert.equal(digitGaps.length, pin.length - 1);
    for (const ms of digitGaps) assert.ok(ms >= LIMITS.minDigitGapMs && ms <= LIMITS.maxDigitGapMs, `${speed} ${pin}: gap ${ms} ms`);
  }
});

test('every off-time within a digit is at most 300 ms, for both speeds', () => {
  assert.deepEqual(SPEED_NAMES.sort(), ['normal', 'slow']);
  for (const speed of SPEED_NAMES) for (const pin of PINS) {
    const { clickGaps } = measure(buildPinSchedule(pin, speed).events);
    assert.equal(clickGaps.length, pin.reduce((a, b) => a + b, 0) - pin.length);
    for (const ms of clickGaps) assert.ok(ms <= LIMITS.maxClickGapMs, `${speed} ${pin}: off ${ms} ms`);
  }
});

test('the final cue comes about one second after the last click', () => {
  for (const speed of SPEED_NAMES) {
    const { events } = buildPinSchedule([2, 2, 2], speed);
    const lastOff = events.filter((e) => e.kind === 'off').at(-1);
    const final = events.at(-1);
    assert.equal(final.kind, 'final');
    assert.equal(final.atMs - lastOff.atMs, 1000);
  }
});

test('112 Normal: click counts per digit', () => {
  const { events } = buildPinSchedule([1, 1, 2], 'normal');
  const ons = events.filter((e) => e.kind === 'on');
  assert.deepEqual(ons.map((e) => [e.digit, e.click]), [[1, 1], [2, 1], [3, 1], [3, 2]]);
  assert.deepEqual(ons.map((e) => e.atMs), [3000, 4200, 5400, 5850]);
  assert.equal(events.at(-1).atMs, 7050);
});

test('custom PIN 375 Slow', () => {
  const { events } = buildPinSchedule([3, 7, 5], 'slow');
  const { ons, onTimes } = measure(events);
  assert.equal(ons.length, 15);
  assert.ok(onTimes.every((ms) => ms === 300));
  assert.deepEqual(ons.filter((e) => e.click === 1).map((e) => e.atMs), [3000, 3000 + 3 * 600 - 300 + 1150, 3000 + 3 * 600 - 300 + 1150 + 7 * 600 - 300 + 1150]);
});

test('invalid PINs are rejected', () => {
  const bad = [[0, 2, 2], [5, 1, 1], [2, 9, 1], [2, 2, 0], [4, 8, 8], [2, 2], [2, 2, 2, 2], [], [2.5, 2, 2], ['2', '2', '2'], null, '222'];
  for (const pin of bad) {
    assert.equal(isValidPin(pin), false, JSON.stringify(pin));
    assert.throws(() => buildPinSchedule(pin, 'normal'), RangeError, JSON.stringify(pin));
  }
  assert.throws(() => buildPinSchedule([2, 2, 2], 'fast'), RangeError);
});

test('parsePin reads typed PINs and rejects bad ones', () => {
  assert.deepEqual(parsePin('222'), [2, 2, 2]);
  assert.deepEqual(parsePin(' 1 1 2 '), [1, 1, 2]);
  assert.deepEqual(parsePin('4-8-7'), [4, 8, 7]);
  for (const text of ['', '0', '022', '522', '291', '488', '22', '2222', 'abc', null, undefined]) {
    assert.equal(parsePin(text), null, String(text));
  }
});

test('isTooLate: on time and slightly late are fine, beyond 150 ms or past the on-time is not', () => {
  const on = { kind: 'on', atMs: 3000, durationMs: 200 };
  assert.equal(isTooLate(on, 3000), false);
  assert.equal(isTooLate(on, 3150), false);
  assert.equal(isTooLate(on, 3151), true);
  assert.equal(isTooLate(on, 3450), true); // the blocked-thread case: on and off would merge
  assert.equal(isTooLate({ kind: 'on', atMs: 0, durationMs: 100 }, 101), true);
  assert.equal(isTooLate({ kind: 'off', atMs: 3200 }, 3349), false);
  assert.equal(isTooLate({ kind: 'off', atMs: 3200 }, 3351), true);
  assert.equal(MAX_LATE_MS, 150);
});
