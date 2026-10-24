import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTheme, nextTheme, themeLabel, themeColor, themeSupported } from '../src/ui/theme.js';

test('parseTheme keeps light and treats everything else, including an old "auto", as dark', () => {
  assert.equal(parseTheme('light'), 'light');
  assert.equal(parseTheme('dark'), 'dark');
  for (const raw of [null, undefined, '', 'auto', 'LIGHT', 'blue', 5]) assert.equal(parseTheme(raw), 'dark');
});

test('nextTheme toggles dark <-> light and treats garbage as dark', () => {
  assert.equal(nextTheme('dark'), 'light');
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('auto'), 'light');
  assert.equal(nextTheme(null), 'light');
});

test('themeLabel says what a click switches to', () => {
  assert.equal(themeLabel('dark'), 'Switch to light theme');
  assert.equal(themeLabel('light'), 'Switch to dark theme');
  assert.equal(themeLabel('auto'), 'Switch to light theme');
});

test('themeColor gives the theme background for the browser bar', () => {
  assert.equal(themeColor('light'), '#f6f4f0');
  assert.equal(themeColor('dark'), '#0b0c0e');
  assert.equal(themeColor('auto'), '#0b0c0e');
  assert.equal(themeColor(undefined), '#0b0c0e');
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
