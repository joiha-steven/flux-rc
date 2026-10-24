// The config object: defaults and normalisation. See docs/config-model.md.
import { cleanMode } from './modes.js';
import { pinField } from './scales.js';

/** Thrown when input cannot be turned into a config at all. */
export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

const level = (n) => ({ type: 'level', level: n });

/** Default modes per group, used to fill gaps. */
export const DEFAULT_MODES = {
  single: [level(6), level(14), level(21), level(28)],
  dual: [level(6), level(14), level(21), { type: 'afterburning' }],
};

/** Per advanced setting: allowed actions, value range and the value used when none is given. */
const SETTINGS = {
  bounce: { actions: ['keep', 'off', 'set'], min: 1, max: 254, value: 179 },
  switchTimeout: { actions: ['keep', 'set'], min: 1, max: 63, value: 16 },
  thermal: { actions: ['keep', 'none', 'set'], min: 1, max: 60, value: 13 },
  singleLimit: { actions: ['keep', 'set'], min: 1, max: 30, value: 27 },
  dualLimit: { actions: ['keep', 'none', 'set'], min: 1, max: 31, value: 31 },
};
const PIN_MAX = [4, 8, 8];

/**
 * True when digits is a PIN the driver accepts: three integers, d1 1-4, d2 and d3 1-8, and not
 * 4-8-8 (field value 255 means "keep current"). The one place these rules live.
 * @param {unknown} digits
 */
export function isValidPin(digits) {
  return Array.isArray(digits) && digits.length === PIN_MAX.length
    && digits.every((d, i) => Number.isInteger(d) && d >= 1 && d <= PIN_MAX[i])
    && pinField(digits) !== 255;
}

/** @returns {object} a fresh default config */
export function defaultConfig() {
  const config = {
    version: 1,
    single: { enabled: true, modes: DEFAULT_MODES.single.map((m) => ({ ...m })) },
    dual: { enabled: false, cells: 'li-ion', modes: DEFAULT_MODES.dual.map((m) => ({ ...m })) },
    memory: 'hybrid',
    protection: true,
    stretch: true,
    pin: { action: 'keep', digits: [2, 2, 2] },
  };
  for (const [key, s] of Object.entries(SETTINGS)) config[key] = { action: 'keep', value: s.value };
  return config;
}

const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

function clampInt(x, min, max, fallback) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, Math.round(x)));
}

function normalizeModes(input, defaults) {
  const list = Array.isArray(input) ? input : [];
  return defaults.map((fallback, i) => {
    const raw = list[i];
    if (raw === null && i > 0) return null;
    return cleanMode(raw) || { ...fallback };
  });
}

function normalizeGroup(input, defaults, withCells) {
  const group = isObject(input) ? input : {};
  const out = { enabled: typeof group.enabled === 'boolean' ? group.enabled : defaults.enabled };
  if (withCells) out.cells = group.cells === 'cr123a' || group.cells === 'li-ion' ? group.cells : 'li-ion';
  out.modes = normalizeModes(group.modes, defaults.modes);
  return out;
}

/**
 * Turn arbitrary data (localStorage, share links) into a valid config. Missing or invalid pieces
 * come from the defaults; numbers are rounded and clamped.
 * @param {unknown} input
 * @returns {object}
 * @throws {ConfigError} if input is not an object
 */
export function normalizeConfig(input) {
  if (!isObject(input)) throw new ConfigError('Config must be an object');
  const base = defaultConfig();
  const out = {
    version: 1,
    single: normalizeGroup(input.single, base.single, false),
    dual: normalizeGroup(input.dual, base.dual, true),
    memory: ['none', 'standard', 'hybrid'].includes(input.memory) ? input.memory : base.memory,
    protection: typeof input.protection === 'boolean' ? input.protection : base.protection,
    stretch: typeof input.stretch === 'boolean' ? input.stretch : base.stretch,
  };
  for (const [key, s] of Object.entries(SETTINGS)) {
    const raw = isObject(input[key]) ? input[key] : {};
    out[key] = {
      action: s.actions.includes(raw.action) ? raw.action : 'keep',
      value: clampInt(raw.value, s.min, s.max, s.value),
    };
  }
  const pin = isObject(input.pin) ? input.pin : {};
  const digits = Array.isArray(pin.digits) ? pin.digits : [];
  out.pin = {
    action: pin.action === 'set' ? 'set' : 'keep',
    digits: PIN_MAX.map((max, i) => clampInt(digits[i], 1, max, 2)),
  };
  return out;
}
