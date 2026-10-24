// Translated mode labels. Words come from the locale (t), numbers from core (LEVELS, AFTERBURNING).
// modeLabel() is the UI's version of core's describeMode(); in English the two are identical
// (test/i18n.test.js checks every mode), so core can keep its English text for its own tests.
import { LEVELS, AFTERBURNING } from '../core/index.js';
import { t } from './i18n.js';

/** "64 ms", "1 s": the signal timings as shown. */
export const durationText = (ms) => (ms >= 1000 ? t('unit.seconds', { n: ms / 1000 }) : t('unit.ms', { n: ms }));

/** "10 % · 3 W" for a level, "100 % · 30 W" for afterburning. */
export function modeDetail(mode) {
  const { percent, power } = mode.type === 'afterburning' ? AFTERBURNING : LEVELS[mode.level - 1];
  return t('mode.detail', { percent, power });
}

/** Name alone: "Level 21", "Afterburning", "Red moonlight", "Custom signal". */
export function modeName(mode) {
  if (mode.type === 'level') return t('mode.level', { level: mode.level });
  return t(`mode.${mode.type}`);
}

/** "Level 21 · 10 % · 3 W", "Red moonlight", "Custom signal · red · single · 64 ms on · 1 s off". */
export function modeLabel(mode) {
  switch (mode.type) {
    case 'level':
    case 'afterburning':
      return t('mode.withDetail', { name: modeName(mode), detail: modeDetail(mode) });
    case 'moonlight':
    case 'sos':
    case 'strobe':
    case 'beacon':
      return modeName(mode);
    case 'signal':
      return t('mode.signalFull', {
        name: modeName(mode),
        color: t(`mode.color.${mode.color}`),
        flashes: t(mode.double ? 'mode.flashes.double' : 'mode.flashes.single'),
        on: durationText(mode.onMs),
        off: durationText(mode.offMs),
      });
    default: throw new TypeError(`Unknown mode type: ${mode && mode.type}`);
  }
}
