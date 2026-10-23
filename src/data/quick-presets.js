// Ready-made starting points for people who do not want to tune every mode.
// Unlike PRESETS (recorded vendor programs), these are flux-rc's own configs.
// Advanced settings stay on 'keep', so the light's vendor limits are untouched.

import { defaultConfig } from '../core/index.js';

const level = (n) => ({ type: 'level', level: n });

/**
 * Build a config from the defaults with only the single-cell modes and memory changed.
 * The dual-cell group stays off, so a two-cell light mirrors the same modes.
 */
function quickConfig(modes, memory) {
  const config = defaultConfig();
  config.single.enabled = true;
  config.single.modes = modes;
  config.dual.enabled = false;
  config.memory = memory;
  return config;
}

/** @type {{ id: string, name: string, description: string, config: object }[]} */
export const QUICK_PRESETS = [
  {
    id: 'everyday',
    name: 'Everyday',
    description: 'Low, medium, high and max (0.12 W to 17 W). Starts in the last mode used.',
    config: quickConfig([level(13), level(19), level(24), level(28)], 'hybrid'),
  },
  {
    id: 'tactical',
    name: 'Tactical',
    description: 'Always starts at max (17 W), then 10 Hz strobe, then a low 0.4 W.',
    config: quickConfig([level(28), { type: 'strobe' }, level(16), null], 'none'),
  },
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Never brighter than 3 W, so it stays cool and easy on the eyes. Starts in the last mode used.',
    config: quickConfig([level(6), level(12), level(17), level(21)], 'hybrid'),
  },
];
