import { h } from './dom.js';

const programOpen = () => { const p = document.getElementById('program'); return Boolean(p) && !p.hidden; };

/** Drops every toast, in the page host and inside dialogs. The Program screen calls this when it opens. */
export function hideToasts() {
  const host = document.getElementById('toasts');
  host?.replaceChildren();
  document.querySelectorAll('.toast-inline').forEach((n) => n.remove());
  try { if (host?.matches(':popover-open')) host.hidePopover(); } catch (error) { console.warn('flux-rc: popover toasts unavailable', error); }
}

/**
 * showToast('text', { label: 'Undo', onClick }). The page host is a popover (top layer, above the
 * bottom bar). A modal dialog makes everything outside it inert, so while one is open the toast is
 * placed inside it instead; otherwise its Undo button could be seen but not used.
 * Nothing is shown while the Program screen is open: it would cover Done, Restart and the square.
 */
export function showToast(message, action) {
  if (programOpen()) return;
  const dialog = [...document.querySelectorAll('dialog[open]')].pop();
  const toast = h('div', { class: dialog ? 'toast toast-inline' : 'toast', ...(dialog && { role: 'status' }) }, h('span', { class: 'toast-text' }, message));
  const remove = () => toast.remove();
  if (action) {
    toast.append(h('button', { type: 'button', class: 'btn btn-ghost btn-small', onclick: () => { action.onClick(); remove(); } }, action.label));
  }
  setTimeout(remove, action ? 8000 : 5000);
  if (dialog) {
    dialog.querySelectorAll('.toast-inline').forEach((n) => n.remove());
    dialog.querySelector('.dlg-head')?.after(toast);
    return;
  }
  const host = document.getElementById('toasts');
  host.replaceChildren(toast);
  try {
    if (host.matches(':popover-open')) host.hidePopover();
    host.showPopover();
  } catch (error) {
    console.warn('flux-rc: popover toasts unavailable', error);
  }
}
