import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeMode } from '../src/core/index.js';
import { entryDetail, entryFull } from '../src/ui/modes-list.js';

const signal = { type: 'signal', color: 'red', double: false, onMs: 64, offMs: 1000 };

test('afterburning detail is the tail of its description', () => {
  const mode = { type: 'afterburning' };
  assert.equal(entryDetail(mode), '100 % · 30 W');
  assert.ok(describeMode(mode).endsWith(entryDetail(mode)));
});

test('an empty slot reads "Not used"', () => {
  assert.equal(entryFull(null), 'Not used · this slot is skipped');
  assert.equal(entryDetail(null), 'This slot is skipped');
});

test('the SOS full text cites the regulation', () => {
  assert.ok(entryFull({ type: 'sos' }).includes('46 CFR 161.013-7'));
});

test('a signal full text is its description', () => {
  assert.equal(entryFull(signal), describeMode(signal));
});
