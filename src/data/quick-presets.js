// Ready-made starting points for people who do not want to tune every mode.
// Unlike PRESETS (recorded vendor programs), these are flux-rc's own configs.
// Advanced settings stay on 'keep', so the light's vendor limits are untouched.

import { defaultConfig } from '../core/index.js';
import { t } from '../ui/i18n.js';

const level = (n) => ({ type: 'level', level: n });

/**
 * Build a config from the defaults with only the modes and memory changed. Without `dualModes`
 * the dual-cell group stays off, so a two-cell light mirrors the single-cell modes.
 */
function quickConfig(modes, memory, dualModes = null) {
  const config = defaultConfig();
  config.single.enabled = true;
  config.single.modes = modes;
  config.dual.enabled = dualModes !== null;
  if (dualModes) { config.dual.cells = 'li-ion'; config.dual.modes = dualModes; }
  config.memory = memory;
  return config;
}

/** Adds `name` and `description` getters: the locale's "quickPreset.<id>.name" / ".description". */
const withText = (preset) => Object.defineProperties(preset, {
  name: { get: () => t(`quickPreset.${preset.id}.name`), enumerable: true },
  description: { get: () => t(`quickPreset.${preset.id}.description`), enumerable: true },
});

/** @type {{ id: string, name: string, description: string, config: object }[]} */
export const QUICK_PRESETS = [
  {
    id: 'everyday',
    config: quickConfig([level(13), level(19), level(24), level(28)], 'hybrid'),
  },
  {
    id: 'tactical',
    config: quickConfig([level(28), { type: 'strobe' }, level(16), null], 'none'),
  },
  {
    id: 'gentle',
    config: quickConfig([level(6), level(12), level(17), level(21)], 'hybrid'),
  },
  {
    // Always starts on red moonlight to keep night vision; slot 4 is a slow red locator blink.
    id: 'camp',
    config: quickConfig([{ type: 'moonlight' }, level(10), level(19),
      { type: 'signal', color: 'red', double: false, onMs: 64, offMs: 3000 }], 'none'),
  },
  {
    id: 'simple',
    config: quickConfig([level(14), level(28), null, null], 'none'),
  },
  {
    // The only quick preset with its own two-cell modes, for lights that take two cells.
    id: 'power',
    config: quickConfig([level(14), level(21), level(28), null], 'hybrid',
      [level(14), level(21), level(28), { type: 'afterburning' }]),
  },
].map(withText);
