// The PIN list for the guide page. Data only; the words for each id are in locales/guide/en.js (pins.<id>).
// `boards` lists the boards the PIN is confirmed on. `sw` (settings only) is the offline switch it toggles.
// `visual` picks how "the light answers" is drawn (src/ui/guide-svg.js). `alt` is a PIN some vendors use for the same job.
export const PIN_GROUPS = ['programming', 'information', 'memory', 'settings'];

export const PINS = [
  { id: 'p112', group: 'programming', digits: [1, 1, 2], visual: 'dim', boards: ['v1', 'v2'] },
  { id: 'p222', group: 'programming', digits: [2, 2, 2], visual: 'dim', boards: ['v1', 'v2'] },
  { id: 'p111', group: 'information', digits: [1, 1, 1], visual: 'volt', boards: ['v1', 'v2'] },
  { id: 'p113', group: 'information', digits: [1, 1, 3], visual: 'stars', boards: ['v2'] },
  { id: 'p311', group: 'information', digits: [3, 1, 1], visual: 'switches', boards: ['v2'] },
  { id: 'p4', group: 'memory', digits: [4], visual: 'files', alt: [1, 1, 4], boards: ['v2'] },
  { id: 'p331', group: 'settings', digits: [3, 3, 1], visual: 'toggle', sw: 1, boards: ['v2'] },
  { id: 'p332', group: 'settings', digits: [3, 3, 2], visual: 'toggle', sw: 2, boards: ['v2'] },
  { id: 'p333', group: 'settings', digits: [3, 3, 3], visual: 'toggle', sw: 3, boards: ['v2'] },
  { id: 'p334', group: 'settings', digits: [3, 3, 4], visual: 'toggle', sw: 4, boards: ['v2'] },
  { id: 'p335', group: 'settings', digits: [3, 3, 5], visual: 'toggle', sw: 5, boards: ['v2'] },
  { id: 'p336', group: 'settings', digits: [3, 3, 6], visual: 'toggle', sw: 6, boards: ['v2'] },
  { id: 'p337', group: 'settings', digits: [3, 3, 7], visual: 'toggle', sw: 7, boards: ['v2'] },
];

export const SWITCH_COUNT = 7;

/** "1 · 1 · 2" */
export const formatPin = (digits) => digits.join(' · ');

/** The PINs shown for one board ('v1' or 'v2'): v2-only cards are hidden for v1. */
export const pinsFor = (board) => PINS.filter((pin) => pin.boards.includes(board));
