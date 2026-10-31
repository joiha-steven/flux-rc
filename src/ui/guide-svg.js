// Small pictures for the guide page, as HTML/SVG strings (no DOM, so scripts/build-guide.mjs can use them in Node).
// Colours come from CSS (styles/guide.css). Flash colours are literal on purpose: they stand for the light's real colours.
export const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ICON_PATHS = {
  programming: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9z"/>',
  information: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8v.01"/>',
  memory: '<path d="M7 4h7l4 4v12H7z"/><path d="M14 4v4h4M10 13h5M10 16h5"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
};

export function iconSvg(name) {
  return `<svg class="g-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
}

/** The click pattern of a PIN: one short bar per click, a wider gap between digits. */
export function patternSvg(digits, label) {
  const bar = 5, step = 9, between = 12, height = 24;
  let x = 0;
  const rects = [];
  digits.forEach((count, i) => {
    if (i) x += between;
    for (let k = 0; k < count; k++) { rects.push(`<rect x="${x}" y="0" width="${bar}" height="${height}" rx="1.5"/>`); x += step; }
  });
  const width = x - (step - bar);
  return `<svg class="g-pattern" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(label)}">${rects.join('')}</svg>`;
}

/** The PIN 1-1-2 timing strip. Scale: 60 px per second. */
export function timingSvg(s) {
  const wave = 'M10 70 V30 H22 V70 H82 V30 H94 V70 H154 V30 H166 V70 H178 V30 H190 V70 H250 V30 H330';
  const text = (x, y, cls, value) => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${esc(value)}</text>`;
  const digits = [16, 88, 172].map((x, i) => text(x, 20, 'timing-digit', s.timingDigit.replace('{n}', i + 1))).join('');
  const gaps = [[52, s.timingOff], [124, s.timingOff], [220, s.timingWait]].map(([x, v]) => text(x, 92, 'timing-gap', v)).join('');
  return `<svg class="timing-svg" viewBox="0 0 340 100" role="img" aria-label="${esc(s.timingLabel)}"><line x1="10" y1="70" x2="330" y2="70" class="timing-base"/><path d="${wave}" class="timing-wave"/>${digits}${gaps}${text(290, 20, 'timing-gap', s.timingOn)}</svg>`;
}

/** A simple board drawing: a rounded outline with one dot per mode slot (4 on v1, 4 rows of 8 on v2). */
export function boardSvg(rows, perRow, label) {
  const dots = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < perRow; c++) dots.push(`<circle cx="${14 + c * 8}" cy="${rows === 1 ? 20 : 12 + r * 8}" r="2.4"/>`);
  const width = 28 + (perRow - 1) * 8, height = rows === 1 ? 40 : 24 + (rows - 1) * 8;
  return `<svg class="g-board-art" viewBox="0 0 ${width} ${height}" width="${width * 2}" height="${height * 2}" role="img" aria-label="${esc(label)}"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>${dots.join('')}</svg>`;
}

const flashes = (count, colour) => `<span class="fl fl-${colour}"></span>`.repeat(count);
const star = (on) => `<svg class="g-star${on ? ' is-on' : ''}" viewBox="0 0 24 24" width="18" height="18"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/></svg>`;
const row = (dots, caption) => `<span class="g-row"><span class="g-dotset">${dots}</span>${caption ? `<span class="g-cap">${esc(caption)}</span>` : ''}</span>`;

/** "The light answers" as a picture. `words` is s.pins[id], `v` is s.visual. */
export function answerVisual(pin, words, v) {
  const n = pin.sw;
  switch (pin.visual) {
    case 'dim': return row(flashes(1, 'dim'), v.dim);
    case 'volt': return row(flashes(3, 'white') + '<span class="g-sep"></span>' + flashes(6, 'red'), v.volt);
    case 'stars': return row([1, 1, 1, 1, 0].map(star).join(''), v.stars);
    case 'switches': return row([...'wwrwrww'].map((c) => flashes(1, c === 'w' ? 'white' : 'red')).join(''), v.switches);
    case 'files': return row([0, 1, 0, 0].map((on) => `<span class="g-file${on ? ' is-on' : ''}"></span>`).join(''), v.files);
    default: return row(flashes(n, 'white'), words.on) + row(flashes(n, 'red'), words.off);
  }
}
