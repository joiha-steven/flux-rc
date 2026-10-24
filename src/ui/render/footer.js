// Footer: Advanced toggle (left); loop time, More menu and Program (right).
// Issues strip above it. Below 1200 px the right side becomes a sticky bottom bar (CSS).
import { h, keepFocus } from '../dom.js';
import { derive } from '../derive.js';
import { issueNode, issueText } from '../issues.js';
import { icon } from '../icons.js';
import { openDialog } from '../dialog.js';
import { FIELD_IDS } from '../../core/index.js';
import { t, tParts } from '../i18n.js';

function packetDetails(program) {
  const rows = program.fields.map((v, i) => h('tr', {}, h('th', { scope: 'row' }, t(`field.${FIELD_IDS[i]}`)), h('td', {}, v === null || v === undefined ? t('packet.noChange') : String(v))));
  return [h('table', { class: 'fields' }, h('tbody', {}, rows)), h('p', { class: 'meta' }, t('packet.meta', { checksum: program.checksum, frames: program.frames.length }))];
}

export function mountFooter({ footer, strip, panel, store, actions }) {
  let advOpen = false;
  let menuOpen = false;
  const setMenu = (open) => { menuOpen = open; draw(store.get()); };
  document.addEventListener('click', (e) => { if (menuOpen && !e.target.closest('.menu-wrap')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (menuOpen && e.key === 'Escape') { setMenu(false); footer.querySelector('[data-k="more"]')?.focus(); } });

  function draw(c) {
    const d = derive(c);
    const reason = d.errors[0] && issueText(d.errors[0]);
    const loop = d.program ? t('unit.seconds', { n: (d.program.durationMs / 1000).toFixed(1) }) : '—';
    const blocked = d.canProgram ? '' : t('footer.blocked', { reason: reason || t('footer.blockedUnknown') });
    const item = (label, fn) => h('button', { type: 'button', class: 'menu-item', onclick: () => { menuOpen = false; draw(store.get()); fn(); } }, label);
    strip.hidden = d.issues.length === 0;
    strip.replaceChildren(...d.issues.map(issueNode));
    panel.hidden = !advOpen;
    keepFocus(footer, () => footer.replaceChildren(
      h('button', { type: 'button', class: 'adv-toggle', 'data-k': 'advanced', 'aria-expanded': String(advOpen), 'aria-controls': 'advanced-body',
        onclick: () => { advOpen = !advOpen; draw(store.get()); } },
      icon('lock'), h('span', {}, tParts('footer.advanced', { note: h('span', { class: 'muted' }, t('footer.advancedNote')) })), icon(advOpen ? 'chevronUp' : 'chevronDown', 16)),
      h('div', { class: 'footer-actions' },
        h('p', { class: 'loop' }, h('span', {}, tParts('footer.perLoop', { loop: h('b', {}, loop) })), !d.canProgram && h('span', { class: 'loop-error' }, t('footer.fixErrors'))),
        h('div', { class: 'menu-wrap' },
          h('button', { type: 'button', class: 'btn btn-icon', 'data-k': 'more', 'aria-label': t('footer.more'), 'aria-haspopup': 'true', 'aria-expanded': String(menuOpen), onclick: () => setMenu(!menuOpen) }, icon('more')),
          menuOpen && h('div', { class: 'menu' },
            item(t('footer.save'), actions.save), item(t('footer.share'), actions.share),
            h('button', { type: 'button', class: 'menu-item', disabled: !d.canProgram, 'aria-describedby': d.canProgram ? null : 'menu-reason', onclick: () => { menuOpen = false; draw(store.get()); actions.download(); } }, t('footer.download')),
            h('button', { type: 'button', class: 'menu-item', disabled: !d.program, onclick: () => { menuOpen = false; draw(store.get()); openDialog(t('footer.packet'), () => packetDetails(d.program)); } }, t('footer.packet')),
            !d.canProgram && h('p', { class: 'menu-note', id: 'menu-reason' }, t('footer.downloadOff', { reason: reason || t('issue.internal') })))),
        h('button', { type: 'button', class: 'btn btn-primary', 'data-k': 'program', disabled: !d.canProgram, title: blocked || null, 'aria-describedby': d.canProgram ? null : 'program-reason', onclick: actions.program }, icon('play', 16), t('footer.program')),
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
