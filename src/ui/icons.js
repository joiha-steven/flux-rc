// Inline SVG icons, 1.5 px line style. Returned as elements so they can sit inside h() calls.
const PATHS = {
  memory: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 3 3 3 0 0 0 1 4 3 3 0 0 0 4 3h1V4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 3 3 3 0 0 1-1 4 3 3 0 0 1-4 3h-1V4z"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
  bars: '<path d="M5 20v-5M10 20v-9M15 20V7M20 20V4"/>',
  bounce: '<path d="M9 11V6a2 2 0 0 1 4 0v5M13 10a2 2 0 0 1 4 0v1a2 2 0 0 1 3 1v3c0 3-2 6-5 6h-3c-2 0-3-1-4-2l-3-4a2 2 0 0 1 3-2l1 1"/><path d="M5 5a6 6 0 0 1 2-2M19 5a6 6 0 0 0-2-2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chevronRight: '<path d="M9 6l6 6-6 6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  chevronUp: '<path d="M6 15l6-6 6 6"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  play: '<path d="M7 5l12 7-12 7z" fill="currentColor"/>',
  list: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  power: '<path d="M12 4v8"/><path d="M7 7a7 7 0 1 0 10 0"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  closer: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 20v-7M9 15l3-3 3 3"/>',
};

export function icon(name, size = 20) {
  const span = document.createElement('span');
  span.className = 'icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
  return span;
}
