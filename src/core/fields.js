// Config -> the 15 protocol fields. See docs/protocol.md section 4 and docs/config-model.md.
import { modeCode } from './modes.js';
import { pinField } from './scales.js';

/** Short names of the 15 fields, in protocol order. */
export const FIELD_NAMES = [
  'Single-cell mode 1', 'Single-cell mode 2', 'Single-cell mode 3', 'Single-cell mode 4',
  'Dual-cell mode 1', 'Dual-cell mode 2', 'Dual-cell mode 3', 'Dual-cell mode 4',
  'Options', 'Mode switch timeout', 'Thermal cutoff', 'Single-cell limit', 'Dual-cell limit',
  'PIN', 'Bounce sensor',
];

const MEMORY = { none: 0, standard: 8, hybrid: 24 };

/** Codes of a group's modes: unused modes removed, padded with null to four. */
function groupFields(group) {
  const codes = group.modes.filter(Boolean).map(modeCode);
  while (codes.length < 4) codes.push(null);
  return codes;
}

function optionsField(config) {
  const sum = MEMORY[config.memory] + (config.protection ? 1 : 0) + (config.stretch ? 4 : 0)
    + (config.dual.enabled && config.dual.cells === 'cr123a' ? 2 : 0);
  return sum === 0 ? null : sum;
}

/** Field value for a setting with a `keep`/`set` action and optional extra action. */
function setting(s, extra = {}) {
  if (s.action === 'set') return s.value;
  if (Object.hasOwn(extra, s.action)) return extra[s.action];
  return null;
}

/**
 * The 15 protocol fields for a config. `null` means "leave unchanged".
 * @param {object} config a normalised config
 * @returns {(number|null)[]}
 */
export function configToFields(config) {
  const { single, dual } = config;
  const nulls = [null, null, null, null];
  let singleCodes;
  let dualCodes;
  if (single.enabled && dual.enabled) {
    singleCodes = groupFields(single);
    dualCodes = groupFields(dual);
  } else if (single.enabled) {
    singleCodes = dualCodes = groupFields(single);
  } else if (dual.enabled) {
    singleCodes = dualCodes = groupFields(dual);
  } else {
    singleCodes = dualCodes = nulls;
  }
  return [
    ...singleCodes,
    ...dualCodes,
    optionsField(config),
    setting(config.switchTimeout),
    setting(config.thermal, { none: 127 }),
    setting(config.singleLimit),
    setting(config.dualLimit, { none: 32 }),
    config.pin.action === 'set' ? pinField(config.pin.digits) : null,
    setting(config.bounce, { off: 255 }),
  ];
}
