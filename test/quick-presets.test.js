import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configToFields, normalizeConfig, validateConfig } from '../src/core/index.js';
import { QUICK_PRESETS } from '../src/data/quick-presets.js';

test('there are exactly six quick presets with unique ids', () => {
  assert.equal(QUICK_PRESETS.length, 6);
  assert.equal(new Set(QUICK_PRESETS.map((p) => p.id)).size, 6);
});

for (const preset of QUICK_PRESETS) {
  test(`quick preset "${preset.name}" is valid and survives normalization`, () => {
    assert.deepEqual(validateConfig(preset.config).filter((i) => i.severity !== 'info'), []);
    assert.deepEqual(normalizeConfig(preset.config), preset.config);
  });

  test(`quick preset "${preset.name}" leaves advanced settings unchanged`, () => {
    const fields = configToFields(preset.config);
    assert.deepEqual(fields.slice(9), [null, null, null, null, null, null]);
  });
}

test('quick preset mode fields', () => {
  const byId = Object.fromEntries(QUICK_PRESETS.map((p) => [p.id, configToFields(p.config)]));
  // Level n is code 30 + n; strobe is 4; the dual group mirrors the single group.
  assert.deepEqual(byId.everyday.slice(0, 9), [43, 49, 54, 58, 43, 49, 54, 58, 29]);
  assert.deepEqual(byId.tactical.slice(0, 9), [58, 4, 46, null, 58, 4, 46, null, 5]);
  assert.deepEqual(byId.gentle.slice(0, 9), [36, 42, 47, 51, 36, 42, 47, 51, 29]);
  // Red moonlight is 1; 27 is a red single-flash signal, 64 ms on, 3 s off.
  assert.deepEqual(byId.camp.slice(0, 9), [1, 40, 49, 27, 1, 40, 49, 27, 5]);
  assert.deepEqual(byId.simple.slice(0, 9), [44, 58, null, null, 44, 58, null, null, 5]);
  // Power has its own two-cell modes, ending in afterburning (63).
  assert.deepEqual(byId.power.slice(0, 9), [44, 51, 58, null, 44, 51, 58, 63, 29]);
});
