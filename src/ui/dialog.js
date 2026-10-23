// Native <dialog> wrapper. Centered dialog on tablet/desktop, bottom sheet on phones (CSS only).
// showModal() gives role=dialog semantics, a focus trap, Escape to close and focus restore.
import { h, keepFocus } from './dom.js';
import { icon } from './icons.js';
import { repaint } from './issues.js';

let count = 0;

/** buildBody(render, dlg) returns nodes; call render() to rebuild after a change. */
export function openDialog(title, buildBody, { initialFocus, className = '' } = {}) {
  const titleId = `dlg-title-${++count}`;
  const body = h('div', { class: 'dlg-body' });
  const dlg = h('dialog', { class: `dlg ${className}`, 'aria-labelledby': titleId, 'aria-modal': 'true' },
    h('div', { class: 'dlg-head' }, h('h2', { id: titleId }, title),
      h('button', { type: 'button', class: 'btn btn-ghost btn-icon', 'aria-label': 'Close', onclick: () => dlg.close() }, icon('close'))),
    body);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.body.append(dlg);
  const render = () => {
    keepFocus(body, () => body.replaceChildren(...buildBody(render, dlg).flat(Infinity).filter(Boolean)));
    repaint();
    // dlg.focusKey: the data-k of the control that should take focus after the next rebuild
    // (for example the Rename button after renaming, when the control that had focus is gone).
    if (dlg.focusKey) {
      [...body.querySelectorAll('[data-k]')].find((n) => n.getAttribute('data-k') === dlg.focusKey)?.focus({ preventScroll: true });
      dlg.focusKey = null;
    }
  };
  dlg.rerender = render;
  render();
  dlg.showModal();
  if (initialFocus) body.querySelector(initialFocus)?.focus();
  return dlg;
}
