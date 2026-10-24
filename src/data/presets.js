// Vendor presets, from the programmer samples recorded in test/fixtures/samples.json.
// `source` is the original 51-value string; parse it with parseSource().
// Name and description are read from the locale (locales: "vendorPreset.<id>.name" / ".description").
import { t } from '../ui/i18n.js';

/** Adds `name` and `description` getters that return the current locale's text for the preset's id. */
const withText = (preset) => Object.defineProperties(preset, {
  name: { get: () => t(`vendorPreset.${preset.id}.name`), enumerable: true },
  description: { get: () => t(`vendorPreset.${preset.id}.description`), enumerable: true },
});

/** @type {{ id: string, name: string, description: string, source: string }[]} */
export const PRESETS = [
  {
    id: 'fl33-v4-factory',
    source: '1S,31,0,4,0,36,0,4,0,41,0,4,0,46,0,4,0,2S,51,0,4,0,56,0,4,0,63,0,4,0,0,0,4,0,8,1,4,0,81,0,41,0,45,0,4,0,1,0,1,7,1',
  },
  {
    id: 'minion-factory',
    source: '0,29,0,0,24,31,0,4,0,48,0,4,0,61,0,4,0,2S,1,2,4,24,36,0,4,0,48,0,4,0,63,0,4,0,8,1,4,S,111,S,16,S,52,S,4,S,6,S,0,0,1',
  },
  {
    id: 'oem-mark',
    source: '1S,1,0,0,24,37,0,4,0,41,0,4,0,45,0,4,0,2S,49,2,4,24,53,0,4,0,56,0,4,0,63,0,4,0,0,1,4,0,111,0,41,0,42,0,4,0,1,0,0,0,1',
  },
  {
    id: 'oveready-factory',
    source: '1S,1,0,4,0,44,0,4,0,51,0,4,0,58,0,4,0,2S,1,0,4,0,46,0,4,0,54,0,4,0,63,0,4,0,0,1,4,255,26,S,41,S,45,0,4,0,1,S,1,1,1',
  },
  {
    id: 'pin-112',
    source: '0,S,0,0,24,42,0,4,0,33,0,4,0,41,0,4,0,0,S,1,4,24,31,0,4,0,48,0,4,0,63,0,4,0,0,1,4,0,141,0,10,0,1,0,3,0,1,S,0,0,1',
  },
  {
    id: 'thermal-50c',
    source: '0,48,0,4,0,0,0,4,0,0,0,0,0,0,0,4,0,0,48,0,4,0,0,0,4,0,0,0,4,0,0,1,4,0,0,0,0,0,31,0,53,S,52,0,4,0,1,0,1,1,1',
  },
  {
    id: 'thermal-60c',
    source: '0,48,0,4,0,0,0,4,0,0,0,0,0,0,0,4,0,0,48,0,4,0,0,0,4,0,0,0,4,0,0,1,4,0,0,0,0,0,31,0,53,S,48,0,4,0,1,0,1,1,1',
  },
  {
    id: 'thermal-70c',
    source: '0,48,0,4,0,0,0,4,0,0,0,0,0,0,0,4,0,0,48,0,4,0,0,0,4,0,0,0,4,0,0,1,4,0,0,0,0,0,31,0,53,S,42,0,4,0,1,0,1,1,1',
  },
  {
    id: 'fast-switch-timing',
    source: '0,1,0,4,0,39,0,4,0,0,0,0,0,0,0,4,0,0,1,0,4,0,46,0,4,0,61,0,4,0,60,1,4,0,0,0,0,0,31,S,53,0,33,0,4,0,1,0,1,1,1',
  },
].map(withText);
