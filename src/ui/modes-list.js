// The ordered list of everything a mode slot can be, plus labels and artwork for each entry.
import { t } from './i18n.js';
import { LEVELS } from '../core/index.js';
import { modeName, modeDetail, modeLabel, modePercent, afterburningTileDetail } from './mode-text.js';

const BANDS = [
  { file: 'beam-low', from: 1, to: 12 }, { file: 'beam-medium', from: 13, to: 20 },
  { file: 'beam-high', from: 21, to: 26 }, { file: 'beam-max', from: 27, to: 32 },
];
const SIGNAL_DEFAULT = { type: 'signal', color: 'red', double: false, onMs: 64, offMs: 1000 };

/** Order used by the up/down chevrons and the picker. null = "Not used" (slots 2–4 only). */
export const ENTRIES = [
  null, { type: 'moonlight' },
  ...Array.from({ length: 32 }, (_, i) => ({ type: 'level', level: i + 1 })),
  { type: 'afterburning' }, { type: 'sos' }, { type: 'strobe' }, { type: 'beacon' }, { ...SIGNAL_DEFAULT },
];

export function entryIndex(mode) {
  if (!mode) return 0;
  return ENTRIES.findIndex((e, i) => i > 0 && e.type === mode.type && (mode.type !== 'level' || e.level === mode.level));
}

/** The mode at ENTRIES[index]; a signal keeps its settings when the previous mode was a signal. */
export function entryMode(index, previous) {
  const entry = ENTRIES[index];
  if (!entry) return null;
  return entry.type === 'signal' && previous?.type === 'signal' ? previous : structuredClone(entry);
}

export function beam(mode) {
  const base = 'assets/';
  if (!mode) return null;
  if (mode.type === 'level') {
    const band = BANDS.find((b) => mode.level >= b.from && mode.level <= b.to);
    const shade = 0.6 + (0.4 * (mode.level - band.from)) / (band.to - band.from);
    return { src: `${base}${band.file}.webp`, thumb: `${base}${band.file}-thumb.webp`, shade: shade.toFixed(2) };
  }
  const file = { moonlight: 'beam-moonlight', afterburning: 'beam-afterburning', sos: 'beam-strobe', strobe: 'beam-strobe', beacon: 'beam-beacon' }[mode.type]
    || (mode.color === 'white' ? 'beam-strobe' : 'beam-beacon');
  return { src: `${base}${file}.webp`, thumb: `${base}${file}-thumb.webp`, shade: '1' };
}

export const signalName = (m) => t(m.double ? 'mode.signalShortDouble' : 'mode.signalShort', { color: t(`mode.color.${m.color}`) });

/**
 * Tile top-left text as two lines. A level shows its power, then the tight percent ("8.3 mW" / "0.03%");
 * afterburning shows its name, then "100% · 30 W"; other modes show their name only (secondary is null).
 */
export function tileText(mode) {
  if (mode.type === 'level') return { primary: LEVELS[mode.level - 1].power, secondary: modePercent(mode) };
  if (mode.type === 'afterburning') return { primary: modeName(mode), secondary: afterburningTileDetail() };
  return { primary: mode.type === 'signal' ? signalName(mode) : modeLabel(mode), secondary: null };
}

export const tileCode = (mode) => (mode.type === 'level' ? String(mode.level) : t(`mode.code.${mode.type}`));

/** Plain-words name for the picker and accessible names: "Level 19", "Red moonlight". */
export const entryName = (mode) => modeName(mode);

/** One short line for the picker's wide cells and detail bar. */
export function entryDetail(mode) {
  if (!mode) return t('mode.skipped');
  if (mode.type === 'level' || mode.type === 'afterburning') return modeDetail(mode);
  return t(`mode.detail.${mode.type}`);
}

/** The full description for the picker's detail bar and accessible names: "Level 21 · 10 % · 3 W". */
export function entryFull(mode) {
  if (!mode) return t('mode.notUsedFull');
  if (mode.type === 'level' || mode.type === 'afterburning' || mode.type === 'signal') return modeLabel(mode);
  if (mode.type === 'sos') return t('mode.sosFull', { name: modeLabel(mode) });
  return t('mode.withDetail', { name: entryName(mode), detail: entryDetail(mode) });
}
