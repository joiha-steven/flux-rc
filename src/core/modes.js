// Modes: mode codes, validation of mode objects and display labels.
// See docs/protocol.md section 5 and docs/config-model.md.
import { LEVELS, AFTERBURNING } from './levels.js';

const ON_BITS = { 64: 4, 250: 0 };
const OFF_BITS = { 32: 0, 250: 8, 1000: 16, 3000: 24 };
// Only real numbers match: `includes` uses strict equality, so '250' or 'toString' never pass.
const ON_VALUES = [64, 250];
const OFF_VALUES = [32, 250, 1000, 3000];
const OFF_LABELS = { 32: '32 ms', 250: '250 ms', 1000: '1 s', 3000: '3 s' };

/**
 * Protocol code of a mode (0-63).
 * @param {object} mode
 * @returns {number}
 */
export function modeCode(mode) {
  switch (mode.type) {
    case 'level': return 30 + mode.level;
    case 'afterburning': return 63;
    case 'moonlight': return 1;
    case 'sos': return 2;
    case 'strobe': return 4;
    case 'beacon': return 29;
    case 'signal': {
      const sum = (mode.color === 'white' ? 1 : 0) + (mode.double ? 2 : 0)
        + ON_BITS[mode.onMs] + OFF_BITS[mode.offMs] - 1;
      return ((sum % 64) + 64) % 64;
    }
    default: throw new TypeError(`Unknown mode type: ${mode && mode.type}`);
  }
}

/**
 * Mode for a protocol code 1-63 (as found in source strings). Codes 0-30 that are not one of the
 * named signals decode to a custom signal.
 * @param {number} code
 * @returns {object|null} null if the code is not a valid mode
 */
export function modeFromCode(code) {
  if (!Number.isInteger(code) || code < 1 || code > 63) return null;
  if (code === 63) return { type: 'afterburning' };
  if (code >= 31) return { type: 'level', level: code - 30 };
  if (code === 1) return { type: 'moonlight' };
  if (code === 2) return { type: 'sos' };
  if (code === 4) return { type: 'strobe' };
  if (code === 29) return { type: 'beacon' };
  const v = code + 1;
  return {
    type: 'signal',
    color: v & 1 ? 'white' : 'red',
    double: Boolean(v & 2),
    onMs: v & 4 ? 64 : 250,
    offMs: [32, 250, 1000, 3000][(v >> 3) & 3],
  };
}

/** True for the one signal timing the original refuses (250 ms on + 32 ms off). */
export function isUnsupportedSignal(mode) {
  return mode.type === 'signal' && mode.onMs === 250 && mode.offMs === 32;
}

/**
 * Check a mode object and return a clean copy, or null if it is not a valid mode.
 * @param {unknown} input
 * @returns {object|null}
 */
export function cleanMode(input) {
  if (!input || typeof input !== 'object') return null;
  switch (input.type) {
    case 'level':
      return Number.isInteger(input.level) && input.level >= 1 && input.level <= 32
        ? { type: 'level', level: input.level } : null;
    case 'afterburning':
    case 'moonlight':
    case 'sos':
    case 'strobe':
    case 'beacon':
      return { type: input.type };
    case 'signal':
      if ((input.color !== 'red' && input.color !== 'white') || typeof input.double !== 'boolean'
        || !ON_VALUES.includes(input.onMs) || !OFF_VALUES.includes(input.offMs)) return null;
      return { type: 'signal', color: input.color, double: input.double, onMs: input.onMs, offMs: input.offMs };
    default:
      return null;
  }
}

/**
 * Short human label for a mode.
 * @param {object} mode
 * @returns {string}
 */
export function describeMode(mode) {
  switch (mode.type) {
    case 'level': {
      const { percent, power } = LEVELS[mode.level - 1];
      return `Level ${mode.level} · ${percent} % · ${power}`;
    }
    case 'afterburning': return `Afterburning · ${AFTERBURNING.percent} % · ${AFTERBURNING.power}`;
    case 'moonlight': return 'Red moonlight';
    case 'sos': return 'S.O.S.';
    case 'strobe': return '10 Hz strobe';
    case 'beacon': return 'Red beacon';
    case 'signal':
      return ['Custom signal', mode.color, mode.double ? 'double' : 'single',
        `${mode.onMs} ms on`, `${OFF_LABELS[mode.offMs]} off`].join(' · ');
    default: throw new TypeError(`Unknown mode type: ${mode && mode.type}`);
  }
}
