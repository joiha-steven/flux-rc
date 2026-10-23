// Native <dialog> wrapper plus the Presets, Saved and Share-link dialogs.
import { h } from './dom.js';
import { openDialog } from './dialog.js';
import { PRESETS } from '../data/presets.js';
import { parseSource, normalizeConfig } from '../core/index.js';
import { listSaved, addSaved, renameSaved, deleteSaved } from './storage.js';
import { shareUrl } from './share.js';
import { showToast } from './toast.js';
import { QUICK_PRESETS } from '../data/quick-presets.js';
import { loadQuick } from './render/quick.js';

export function openPresets(store) {
  let error = '';
  openDialog('Presets', (render, dlg) => [
    error && h('p', { class: 'form-error', role: 'alert' }, error),
    h('h3', { class: 'card-title' }, 'Quick start'),
    h('ul', { class: 'list' }, QUICK_PRESETS.map((q) => h('li', { class: 'list-item' },
      h('span', { class: 'list-title' }, q.name), h('span', { class: 'list-sub' }, q.description),
      h('div', { class: 'list-actions' }, h('button', { type: 'button', class: 'btn btn-small', 'aria-label': `Load quick start ${q.name}`, onclick: () => { loadQuick(store, q); dlg.close(); } }, 'Load'))))),
    h('h3', { class: 'card-title' }, 'Vendor presets'),
    h('p', { class: 'hint' }, 'Settings recorded from the original programmer. Loading one replaces your current setup.'),
    h('ul', { class: 'list' }, PRESETS.map((p) => h('li', { class: 'list-item' },
      h('span', { class: 'list-title' }, p.name),
      h('span', { class: 'list-sub' }, p.description),
      h('div', { class: 'list-actions' }, h('button', {
        type: 'button', class: 'btn btn-small', 'aria-label': `Load preset ${p.name}`, 'data-k': `preset:${p.name}`,
        onclick: () => {
          const before = store.get();
          try { store.replace(parseSource(p.source)); } catch (e) {
            console.error('flux-rc: preset could not be loaded', e);
            error = 'That preset could not be loaded.';
            render();
            return;
          }
          dlg.close();
          showToast(`Loaded preset “${p.name}”.`, { label: 'Undo', onClick: () => store.replace(before) });
        },
      }, 'Load'))))),
  ]);
}

const when = (t) => {
  const date = new Date(t);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export function openSaved(store) {
  const ui = { renaming: null, renameValue: null, deleting: null, error: '', name: '' };
  openDialog('Saved', (render, dlg) => {
    const { ok, items } = listSaved();
    if (!ok) return [h('p', { class: 'note' }, 'Saving is not available in this browser (local storage is blocked). Everything else still works, and Share link keeps a copy in a link.')];
    // Every state change goes through go(): it sets what should have focus once the list is rebuilt.
    const go = (focusKey) => { dlg.focusKey = focusKey; render(); };
    const input = h('input', {
      type: 'text', class: 'text-input', id: 'save-name', maxlength: 80, autocomplete: 'off', 'data-k': 'save-name', value: ui.name,
      'aria-describedby': ui.error ? 'saved-error' : null, 'aria-invalid': ui.error ? 'true' : null,
      oninput: (e) => { ui.name = e.target.value; },
    });
    const save = (e) => {
      e.preventDefault();
      const name = input.value.trim();
      if (!name) { ui.error = 'Enter a name first.'; go('save-name'); return; }
      if (addSaved(name, store.get())) { ui.error = ''; ui.name = ''; showToast(`Saved “${name}”.`); }
      else ui.error = 'Could not save. Browser storage may be full or blocked.';
      go('save-name');
    };
    const itemRow = (item) => {
      const name = String(item.name ?? 'Untitled');
      if (ui.renaming === item.id) {
        const field = h('input', { type: 'text', class: 'text-input', maxlength: 80, value: ui.renameValue ?? name, 'data-k': 'rename-field', 'aria-label': `New name for ${name}`,
          oninput: (e) => { ui.renameValue = e.target.value; } });
        const submit = (e) => {
          e.preventDefault();
          if (!field.value.trim()) return;
          if (!renameSaved(item.id, field.value.trim())) {
            ui.renameValue = field.value; // keep what the user typed
            ui.error = 'Could not rename. Browser storage may be full or blocked.';
            go('rename-field');
            return;
          }
          ui.renaming = null; ui.renameValue = null; ui.error = '';
          go(`rename:${item.id}`);
        };
        return h('li', { class: 'list-item' }, h('form', { class: 'inline-form', onsubmit: submit },
          field, h('div', { class: 'list-actions' }, h('button', { type: 'submit', class: 'btn btn-small' }, 'Rename'),
            h('button', { type: 'button', class: 'btn btn-small btn-ghost', onclick: () => { ui.renaming = null; ui.renameValue = null; ui.error = ''; go(`rename:${item.id}`); } }, 'Cancel'))));
      }
      if (ui.deleting === item.id) {
        return h('li', { class: 'list-item' }, h('span', { class: 'list-title', title: name }, `Delete “${name}”?`),
          h('div', { class: 'list-actions' },
            h('button', { type: 'button', class: 'btn btn-small btn-danger', 'data-k': `delete-confirm:${item.id}`, onclick: () => {
              if (!deleteSaved(item.id)) { ui.error = 'Could not delete. Browser storage may be blocked.'; go(`delete-confirm:${item.id}`); return; }
              ui.deleting = null; ui.error = ''; go('save-name');
            } }, 'Delete'),
            h('button', { type: 'button', class: 'btn btn-small', 'data-k': `delete-cancel:${item.id}`, onclick: () => { ui.deleting = null; ui.error = ''; go(`delete:${item.id}`); } }, 'Cancel')));
      }
      return h('li', { class: 'list-item' },
        h('span', { class: 'list-title', title: name }, name),
        h('span', { class: 'list-sub' }, when(item.savedAt)),
        h('div', { class: 'list-actions' },
          h('button', { type: 'button', class: 'btn btn-small', 'aria-label': `Load ${name}`, 'data-k': `load:${item.id}`, onclick: () => {
            const before = store.get();
            try { store.replace(normalizeConfig(item.config)); } catch (error) {
              console.error('flux-rc: saved config is invalid', error);
              ui.error = 'That saved setup could not be read.';
              go(`load:${item.id}`);
              return;
            }
            dlg.close();
            showToast(`Loaded “${name}”.`, { label: 'Undo', onClick: () => store.replace(before) });
          } }, 'Load'),
          h('button', { type: 'button', class: 'btn btn-small', 'aria-label': `Rename ${name}`, 'data-k': `rename:${item.id}`, onclick: () => { ui.renaming = item.id; ui.renameValue = null; ui.error = ''; go('rename-field'); } }, 'Rename'),
          h('button', { type: 'button', class: 'btn btn-small btn-danger', 'aria-label': `Delete ${name}`, 'data-k': `delete:${item.id}`, onclick: () => { ui.deleting = item.id; ui.error = ''; go(`delete-cancel:${item.id}`); } }, 'Delete')));
    };
    return [
      h('form', { class: 'inline-form', onsubmit: save },
        h('div', { class: 'select-field' }, h('label', { class: 'field-label', for: 'save-name' }, 'Name for the current setup'), input),
        h('button', { type: 'submit', class: 'btn btn-primary', 'data-k': 'save' }, 'Save current')),
      ui.error && h('p', { class: 'form-error', id: 'saved-error', role: 'alert' }, ui.error),
      items.length ? h('ul', { class: 'list' }, items.map(itemRow)) : h('p', { class: 'note' }, 'Nothing saved yet.'),
    ];
  }, { initialFocus: '#save-name' });
}

/** Clipboard first; if it fails, show the link in a read-only field. */
export async function shareLink(config) {
  const url = shareUrl(config);
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied.');
  } catch (error) {
    console.warn('flux-rc: clipboard unavailable', error);
    openDialog('Share link', () => {
      const field = h('input', { type: 'text', class: 'readonly-link', readOnly: true, value: url, 'aria-label': 'Share link', onfocus: (e) => e.target.select() });
      return [h('p', { class: 'hint' }, 'Copy this link to share your setup.'), field];
    }, { initialFocus: 'input' });
  }
}
