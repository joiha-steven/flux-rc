import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTheme, nextTheme, resolveTheme, themeLabel, themeColor, themeSupported } from '../src/ui/theme.js';

test('parseTheme keeps light and dark and treats everything else as auto', () => {
  assert.equal(parseTheme('light'), 'light');
  assert.equal(parseTheme('dark'), 'dark');
  for (const raw of [null, undefined, '', 'auto', 'LIGHT', 'blue', 5]) assert.equal(parseTheme(raw), 'auto');
});

test('nextTheme cycles auto -> light -> dark -> auto', () => {
  assert.equal(nextTheme('auto'), 'light');
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'auto');
  assert.equal(nextTheme('garbage'), 'light');
});

test('resolveTheme: a forced choice beats the device, auto follows it', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('auto', true), 'dark');
  assert.equal(resolveTheme('auto', false), 'light');
  assert.equal(resolveTheme(null, true), 'dark');
});

test('themeLabel names the current state and the next one', () => {
  assert.equal(themeLabel('auto'), 'Theme: auto (follows your device). Switch to light');
  assert.equal(themeLabel('light'), 'Theme: light. Switch to dark');
  assert.equal(themeLabel('dark'), 'Theme: dark. Switch to auto');
});

test('themeColor gives the resolved theme background for the browser bar', () => {
  assert.equal(themeColor('light', true), '#f6f4f0');
  assert.equal(themeColor('dark', false), '#0b0c0e');
  assert.equal(themeColor('auto', true), '#0b0c0e');
  assert.equal(themeColor('auto', false), '#f6f4f0');
});

test('themeSupported is false when CSS.supports is missing or throws', () => {
  assert.equal(themeSupported(), false); // node has no CSS global
  globalThis.CSS = { supports: () => { throw new Error('nope'); } };
  assert.equal(themeSupported(), false);
  globalThis.CSS = { supports: () => true };
  assert.equal(themeSupported(), true);
  globalThis.CSS = { supports: () => false };
  assert.equal(themeSupported(), false);
  delete globalThis.CSS;
});
