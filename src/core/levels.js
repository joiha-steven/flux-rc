// Brightness levels, docs/protocol.md section 5.

const ROWS = [
  [0.005, '1.5 mW'], [0.007, '2 mW'], [0.01, '3 mW'], [0.014, '4 mW'],
  [0.02, '5.8 mW'], [0.03, '8.3 mW'], [0.04, '12 mW'], [0.06, '17 mW'],
  [0.08, '25 mW'], [0.1, '36 mW'], [0.18, '53 mW'], [0.26, '80 mW'],
  [0.4, '120 mW'], [0.6, '180 mW'], [0.9, '270 mW'], [1.4, '400 mW'],
  [2, '0.6 W'], [3, '1 W'], [4.6, '1.4 W'], [7, '2 W'],
  [10, '3 W'], [14, '4 W'], [18, '5.4 W'], [22, '6.5 W'],
  [29, '8.8 W'], [38, '11 W'], [47, '14 W'], [55, '17 W'],
  [63, '19 W'], [70, '21 W'], [74, '23 W'], [80, '24 W'],
];

/** The 32 brightness levels: `{ level, percent, power }`, power as a display string. */
export const LEVELS = ROWS.map(([percent, power], i) => ({ level: i + 1, percent, power }));

/** Afterburning is not a numbered level: 100 % and 30 W. */
export const AFTERBURNING = { percent: 100, power: '30 W' };
