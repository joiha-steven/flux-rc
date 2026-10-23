// Problems the original programmer reports. See docs/protocol.md section 8.
import { isUnsupportedSignal } from './modes.js';
import { pinField } from './scales.js';

const issue = (severity, code, message, path) => ({ severity, code, message, path });

function cr123aIssues(config) {
  const issues = [];
  config.dual.modes.forEach((mode, i) => {
    if (!mode) return;
    const path = `dual.modes.${i}`;
    if ((mode.type === 'level' && mode.level > 25) || mode.type === 'afterburning') {
      issues.push(issue('warning', 'cr123a-output-limit',
        'CR123A cells cannot deliver this level; output is limited to 8.8 W (29 %).', path));
    }
    if (!config.stretch && (mode.type === 'sos' || mode.type === 'strobe')) {
      issues.push(issue('warning', 'cr123a-sos-strobe-stretch',
        'S.O.S. and strobe on CR123A cells need battery stretch turned on.', path));
    }
    if (!config.stretch && mode.type === 'signal' && mode.color === 'white'
      && (mode.offMs === 32 || mode.offMs === 250)) {
      issues.push(issue('warning', 'cr123a-signal-stretch',
        'This white signal on CR123A cells needs battery stretch turned on.', path));
    }
  });
  return issues;
}

/**
 * Check a config. Errors block programming in the original; warnings and info do not.
 * @param {object} config a normalised config
 * @returns {{ severity: 'error'|'warning'|'info', code: string, message: string, path: string }[]}
 */
export function validateConfig(config) {
  const issues = [];
  for (const group of ['single', 'dual']) {
    if (!config[group].enabled) continue;
    config[group].modes.forEach((mode, i) => {
      if (mode && isUnsupportedSignal(mode)) {
        issues.push(issue('error', 'unsupported-signal',
          'This timing is not supported: 250 ms on with 32 ms off.', `${group}.modes.${i}`));
      }
    });
  }
  if (config.pin.action === 'set' && pinField(config.pin.digits) === 255) {
    issues.push(issue('error', 'invalid-pin', 'Invalid PIN: 4-8-8 is not allowed.', 'pin'));
  }
  if (config.dual.enabled && config.dual.cells === 'cr123a') issues.push(...cr123aIssues(config));
  if (config.thermal.action === 'none') {
    issues.push(issue('warning', 'no-thermal-limit',
      'With no thermal limit the driver can reach 120 °C.', 'thermal'));
  }
  if (!config.protection) {
    issues.push(issue('warning', 'protection-off',
      'Low-voltage protection is off; a Li-ion cell can be over-discharged.', 'options'));
  }
  if (!config.single.enabled && !config.dual.enabled) {
    issues.push(issue('info', 'modes-unchanged',
      'Both cell groups are off, so the light keeps its current modes.', 'single'));
  }
  const dualCr123a = config.dual.enabled && config.dual.cells === 'cr123a';
  if (config.memory === 'none' && !config.protection && !config.stretch && !dualCr123a) {
    issues.push(issue('info', 'options-kept',
      'All options are off, so the light keeps its current memory, protection and stretch settings.', 'options'));
  }
  return issues;
}
