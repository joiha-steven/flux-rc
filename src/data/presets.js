// Vendor presets, from the programmer samples recorded in test/fixtures/samples.json.
// `source` is the original 51-value string; parse it with parseSource().

/** @type {{ id: string, name: string, description: string, source: string }[]} */
export const PRESETS = [
  {
    id: 'fl33-v4-factory',
    name: 'FL33 v4 Factory Prog',
    description: 'Single cell: levels 1, 6, 11, 16. Dual cell: levels 21, 26, afterburning. Standard memory, protection and stretch on; advanced settings unchanged.',
    source: '1S,31,0,4,0,36,0,4,0,41,0,4,0,46,0,4,0,2S,51,0,4,0,56,0,4,0,63,0,4,0,0,0,4,0,8,1,4,0,81,0,41,0,45,0,4,0,1,0,1,7,1',
  },
  {
    id: 'minion-factory',
    name: 'MINION Factory Prog',
    description: 'Red moonlight, levels 6 and 18, then afterburning on both cell types. Also sets switch timeout 1.5 s, thermal cutoff 50 °C, both output limits to level 28, bounce sensor, and PIN 1-1-2.',
    source: '0,29,0,0,24,31,0,4,0,48,0,4,0,61,0,4,0,2S,1,2,4,24,36,0,4,0,48,0,4,0,63,0,4,0,8,1,4,S,111,S,16,S,52,S,4,S,6,S,0,0,1',
  },
  {
    id: 'oem-mark',
    name: 'OEM_Mark',
    description: 'Single cell: red moonlight, levels 7, 11, 15. Dual cell: levels 19, 23, 26, afterburning. Memory off, protection and stretch on; advanced settings unchanged.',
    source: '1S,1,0,0,24,37,0,4,0,41,0,4,0,45,0,4,0,2S,49,2,4,24,53,0,4,0,56,0,4,0,63,0,4,0,0,1,4,0,111,0,41,0,42,0,4,0,1,0,0,0,1',
  },
  {
    id: 'oveready-factory',
    name: 'OVEREADY Factory Prog',
    description: 'Red moonlight, then levels 14, 21, 28 (single) or 16, 24, afterburning (dual). Also sets switch timeout 0.7 s, thermal cutoff 65 °C, turns the bounce sensor off and sets PIN 2-2-2.',
    source: '1S,1,0,4,0,44,0,4,0,51,0,4,0,58,0,4,0,2S,1,0,4,0,46,0,4,0,54,0,4,0,63,0,4,0,0,1,4,255,26,S,41,S,45,0,4,0,1,S,1,1,1',
  },
  {
    id: 'pin-112',
    name: 'Set programming PIN to 112',
    description: 'Sets the programming PIN to 1-1-2. Also sets memory off with protection and stretch on; modes and other settings unchanged.',
    source: '0,S,0,0,24,42,0,4,0,33,0,4,0,41,0,4,0,0,S,1,4,24,31,0,4,0,48,0,4,0,63,0,4,0,0,1,4,0,141,0,10,0,1,0,3,0,1,S,0,0,1',
  },
  {
    id: 'thermal-50c',
    name: 'Temperature Limit 50C',
    description: 'Sets the thermal cutoff to 50 °C and leaves everything else unchanged.',
    source: '0,48,0,4,0,0,0,4,0,0,0,0,0,0,0,4,0,0,48,0,4,0,0,0,4,0,0,0,4,0,0,1,4,0,0,0,0,0,31,0,53,S,52,0,4,0,1,0,1,1,1',
  },
  {
    id: 'thermal-60c',
    name: 'Temperature Limit 60C',
    description: 'Sets the thermal cutoff to 60 °C and leaves everything else unchanged.',
    source: '0,48,0,4,0,0,0,4,0,0,0,0,0,0,0,4,0,0,48,0,4,0,0,0,4,0,0,0,4,0,0,1,4,0,0,0,0,0,31,0,53,S,48,0,4,0,1,0,1,1,1',
  },
  {
    id: 'thermal-70c',
    name: 'Temperature Limit 70C',
    description: 'Sets the thermal cutoff to 70 °C and leaves everything else unchanged.',
    source: '0,48,0,4,0,0,0,4,0,0,0,0,0,0,0,4,0,0,48,0,4,0,0,0,4,0,0,0,4,0,0,1,4,0,0,0,0,0,31,0,53,S,42,0,4,0,1,0,1,1,1',
  },
  {
    id: 'fast-switch-timing',
    name: 'Fast switch timing',
    description: 'Sets the mode switch timeout to about 0.4 s and leaves everything else unchanged.',
    source: '0,1,0,4,0,39,0,4,0,0,0,0,0,0,0,4,0,0,1,0,4,0,46,0,4,0,61,0,4,0,60,1,4,0,0,0,0,0,31,S,53,0,33,0,4,0,1,0,1,1,1',
  },
];
