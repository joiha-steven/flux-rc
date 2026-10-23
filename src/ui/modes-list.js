// The ordered list of everything a mode slot can be, plus labels and artwork for each entry.
import { LEVELS, describeMode } from '../core/index.js';

const BANDS = [
  { file: 'beam-low', from: 1, to: 12 }, { file: 'beam-medium', from: 13, to: 20 },
  { file: 'beam-high', from: 21, to: 26 }, { file: 'beam-max', from: 27, to: 32 },
];
const SPECIAL_CODE = { afterburning: 'AB', moonlight: 'RM', sos: 'SOS', strobe: 'STB', beacon: 'BCN', signal: 'SIG' };
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

export const signalName = (m) => `Signal · ${m.color}${m.double ? ' ×2' : ''}`;

/** "0.4 % · 120 mW" for levels, a short name for special modes. */
export function tileLabel(mode) {
  if (mode.type === 'level') { const l = LEVELS[mode.level - 1]; return `${l.percent} % · ${l.power}`; }
  if (mode.type === 'afterburning') return describeMode(mode).replace(' · ', ' ');
  return mode.type === 'signal' ? signalName(mode) : describeMode(mode);
}

/** Tile top label as lines, so a long name never runs into the slot badge: "Afterburning" / "100 % · 30 W". */
export function tileLines(mode) {
  if (mode.type === 'afterburning') return ['Afterburning', describeMode(mode).split(' · ').slice(1).join(' · ')];
  return [tileLabel(mode)];
}

export const tileCode = (mode) => (mode.type === 'level' ? String(mode.level) : SPECIAL_CODE[mode.type]);

/** Plain-words name for the picker and accessible names: "Level 19", "Red moonlight". */
export function entryName(mode) {
  if (mode.type === 'level') return `Level ${mode.level}`;
  if (mode.type === 'afterburning') return 'Afterburning';
  return mode.type === 'signal' ? 'Custom signal' : describeMode(mode);
}

/** One short line for the picker's wide cells and detail bar. */
export function entryDetail(mode) {
  if (!mode) return 'This slot is skipped';
  if (mode.type === 'level') return tileLabel(mode);
  if (mode.type === 'afterburning') return tileLines(mode)[1];
  return {
    moonlight: 'Dim red light', sos: 'Distress pattern', strobe: 'Fast flashing',
    beacon: 'Slow red flash', signal: 'Choose colour and timing',
  }[mode.type];
}

/** The full description for the picker's detail bar and accessible names: "Level 21 · 10 % · 3 W". */
export function entryFull(mode) {
  if (!mode) return 'Not used · this slot is skipped';
  if (mode.type === 'level' || mode.type === 'afterburning' || mode.type === 'signal') return describeMode(mode);
  if (mode.type === 'sos') return `${describeMode(mode)} · Distress pattern per 46 CFR 161.013-7`;
  return `${entryName(mode)} · ${entryDetail(mode)}`;
}
