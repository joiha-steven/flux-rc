// Footer: Advanced toggle (left); loop time, More menu and Program (right).
// Issues strip above it. Below 1200 px the right side becomes a sticky bottom bar (CSS).
import { h, keepFocus } from '../dom.js';
import { derive } from '../derive.js';
import { issueNode } from '../issues.js';
import { icon } from '../icons.js';
import { openDialog } from '../dialog.js';
import { FIELD_NAMES } from '../../core/index.js';

function packetDetails(program) {
  const rows = program.fields.map((v, i) => h('tr', {}, h('th', { scope: 'row' }, FIELD_NAMES[i]), h('td', {}, v === null || v === undefined ? 'no change' : String(v))));
  return [h('table', { class: 'fields' }, h('tbody', {}, rows)), h('p', { class: 'meta' }, `Checksum ${program.checksum} · ${program.frames.length} frames`)];
}

export function mountFooter({ footer, strip, panel, store, actions }) {
  let advOpen = false;
  let menuOpen = false;
  const setMenu = (open) => { menuOpen = open; draw(store.get()); };
  document.addEventListener('click', (e) => { if (menuOpen && !e.target.closest('.menu-wrap')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (menuOpen && e.key === 'Escape') { setMenu(false); footer.querySelector('[data-k="more"]')?.focus(); } });

  function draw(c) {
    const d = derive(c);
    const reason = d.errors[0]?.message;
    const loop = d.program ? `${(d.program.durationMs / 1000).toFixed(1)} s` : '—';
    const blocked = d.canProgram ? '' : `Cannot program: ${reason || 'something went wrong'}`;
    const item = (label, fn) => h('button', { type: 'button', class: 'menu-item', onclick: () => { menuOpen = false; draw(store.get()); fn(); } }, label);
    strip.hidden = d.issues.length === 0;
    strip.replaceChildren(...d.issues.map(issueNode));
    panel.hidden = !advOpen;
    keepFocus(footer, () => footer.replaceChildren(
      h('button', { type: 'button', class: 'adv-toggle', 'data-k': 'advanced', 'aria-expanded': String(advOpen), 'aria-controls': 'advanced-body',
        onclick: () => { advOpen = !advOpen; draw(store.get()); } },
      icon('lock'), h('span', {}, 'Advanced ', h('span', { class: 'muted' }, '(vendor safety settings)')), icon(advOpen ? 'chevronUp' : 'chevronDown', 16)),
      h('div', { class: 'footer-actions' },
        h('p', { class: 'loop' }, h('span', {}, h('b', {}, loop), ' per loop'), !d.canProgram && h('span', { class: 'loop-error' }, 'Fix the errors to program')),
        h('div', { class: 'menu-wrap' },
          h('button', { type: 'button', class: 'btn btn-icon', 'data-k': 'more', 'aria-label': 'More', 'aria-haspopup': 'true', 'aria-expanded': String(menuOpen), onclick: () => setMenu(!menuOpen) }, icon('more')),
          menuOpen && h('div', { class: 'menu' },
            item('Save', actions.save), item('Share link', actions.share),
            h('button', { type: 'button', class: 'menu-item', disabled: !d.canProgram, 'aria-describedby': d.canProgram ? null : 'menu-reason', onclick: () => { menuOpen = false; draw(store.get()); actions.download(); } }, 'Download GIF'),
            h('button', { type: 'button', class: 'menu-item', disabled: !d.program, onclick: () => { menuOpen = false; draw(store.get()); openDialog('Packet details', () => packetDetails(d.program)); } }, 'Packet details'),
            !d.canProgram && h('p', { class: 'menu-note', id: 'menu-reason' }, `Download GIF is off. ${reason || 'Something went wrong building the signal.'}`))),
        h('button', { type: 'button', class: 'btn btn-primary', 'data-k': 'program', disabled: !d.canProgram, title: blocked || null, 'aria-describedby': d.canProgram ? null : 'program-reason', onclick: actions.program }, icon('play', 16), 'Program'),
        !d.canProgram && h('span', { id: 'program-reason', class: 'sr' }, blocked))));
  }

  let frame = 0;
  store.subscribe((c, meta) => {
    if (!meta.live) { draw(c); return; }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => draw(store.get()));
  });
  draw(store.get());
}
