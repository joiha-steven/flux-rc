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
import { t } from './i18n.js';

export function openPresets(store) {
  let error = '';
  openDialog(t('presets.title'), (render, dlg) => [
    error && h('p', { class: 'form-error', role: 'alert' }, error),
    h('h3', { class: 'card-title' }, t('presets.quickHeading')),
    h('ul', { class: 'list' }, QUICK_PRESETS.map((q) => h('li', { class: 'list-item' },
      h('span', { class: 'list-title' }, q.name), h('span', { class: 'list-sub' }, q.description),
      h('div', { class: 'list-actions' }, h('button', { type: 'button', class: 'btn btn-small', 'aria-label': t('presets.loadQuick', { name: q.name }), onclick: () => { loadQuick(store, q); dlg.close(); } }, t('common.load')))))),
    h('h3', { class: 'card-title' }, t('presets.vendorHeading')),
    h('p', { class: 'hint' }, t('presets.vendorHint')),
    h('ul', { class: 'list' }, PRESETS.map((p) => h('li', { class: 'list-item' },
      h('span', { class: 'list-title' }, p.name),
      h('span', { class: 'list-sub' }, p.description),
      h('div', { class: 'list-actions' }, h('button', {
        type: 'button', class: 'btn btn-small', 'aria-label': t('presets.loadPreset', { name: p.name }), 'data-k': `preset:${p.id}`,
        onclick: () => {
          const before = store.get();
          try { store.replace(parseSource(p.source)); } catch (e) {
            console.error('flux-rc: preset could not be loaded', e);
            error = t('presets.loadError');
            render();
            return;
          }
          dlg.close();
          showToast(t('toast.presetLoaded', { name: p.name }), { label: t('common.undo'), onClick: () => store.replace(before) });
        },
      }, t('common.load')))))),
  ]);
}

const when = (t) => {
  const date = new Date(t);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export function openSaved(store) {
  const ui = { renaming: null, renameValue: null, deleting: null, error: '', name: '' };
  openDialog(t('saved.title'), (render, dlg) => {
    const { ok, items } = listSaved();
    if (!ok) return [h('p', { class: 'note' }, t('saved.unavailable'))];
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
      if (!name) { ui.error = t('saved.errorNoName'); go('save-name'); return; }
      if (addSaved(name, store.get())) { ui.error = ''; ui.name = ''; showToast(t('toast.saved', { name })); }
      else ui.error = t('saved.errorSave');
      go('save-name');
    };
    const itemRow = (item) => {
      const name = String(item.name ?? t('saved.untitled'));
      if (ui.renaming === item.id) {
        const field = h('input', { type: 'text', class: 'text-input', maxlength: 80, value: ui.renameValue ?? name, 'data-k': 'rename-field', 'aria-label': t('saved.newName', { name }),
          oninput: (e) => { ui.renameValue = e.target.value; } });
        const submit = (e) => {
          e.preventDefault();
          if (!field.value.trim()) return;
          if (!renameSaved(item.id, field.value.trim())) {
            ui.renameValue = field.value; // keep what the user typed
            ui.error = t('saved.errorRename');
            go('rename-field');
            return;
          }
          ui.renaming = null; ui.renameValue = null; ui.error = '';
          go(`rename:${item.id}`);
        };
        return h('li', { class: 'list-item' }, h('form', { class: 'inline-form', onsubmit: submit },
          field, h('div', { class: 'list-actions' }, h('button', { type: 'submit', class: 'btn btn-small' }, t('common.rename')),
            h('button', { type: 'button', class: 'btn btn-small btn-ghost', onclick: () => { ui.renaming = null; ui.renameValue = null; ui.error = ''; go(`rename:${item.id}`); } }, t('common.cancel')))));
      }
      if (ui.deleting === item.id) {
        return h('li', { class: 'list-item' }, h('span', { class: 'list-title', title: name }, t('saved.deleteConfirm', { name })),
          h('div', { class: 'list-actions' },
            h('button', { type: 'button', class: 'btn btn-small btn-danger', 'data-k': `delete-confirm:${item.id}`, onclick: () => {
              if (!deleteSaved(item.id)) { ui.error = t('saved.errorDelete'); go(`delete-confirm:${item.id}`); return; }
              ui.deleting = null; ui.error = ''; go('save-name');
            } }, t('common.delete')),
            h('button', { type: 'button', class: 'btn btn-small', 'data-k': `delete-cancel:${item.id}`, onclick: () => { ui.deleting = null; ui.error = ''; go(`delete:${item.id}`); } }, t('common.cancel'))));
      }
      return h('li', { class: 'list-item' },
        h('span', { class: 'list-title', title: name }, name),
        h('span', { class: 'list-sub' }, when(item.savedAt)),
        h('div', { class: 'list-actions' },
          h('button', { type: 'button', class: 'btn btn-small', 'aria-label': t('saved.load', { name }), 'data-k': `load:${item.id}`, onclick: () => {
            const before = store.get();
            try { store.replace(normalizeConfig(item.config)); } catch (error) {
              console.error('flux-rc: saved config is invalid', error);
              ui.error = t('saved.errorLoad');
              go(`load:${item.id}`);
              return;
            }
            dlg.close();
            showToast(t('toast.loadedName', { name }), { label: t('common.undo'), onClick: () => store.replace(before) });
          } }, t('common.load')),
          h('button', { type: 'button', class: 'btn btn-small', 'aria-label': t('saved.rename', { name }), 'data-k': `rename:${item.id}`, onclick: () => { ui.renaming = item.id; ui.renameValue = null; ui.error = ''; go('rename-field'); } }, t('common.rename')),
          h('button', { type: 'button', class: 'btn btn-small btn-danger', 'aria-label': t('saved.delete', { name }), 'data-k': `delete:${item.id}`, onclick: () => { ui.deleting = item.id; ui.error = ''; go(`delete-cancel:${item.id}`); } }, t('common.delete'))));
    };
    return [
      h('form', { class: 'inline-form', onsubmit: save },
        h('div', { class: 'select-field' }, h('label', { class: 'field-label', for: 'save-name' }, t('saved.nameLabel')), input),
        h('button', { type: 'submit', class: 'btn btn-primary', 'data-k': 'save' }, t('saved.saveCurrent'))),
      ui.error && h('p', { class: 'form-error', id: 'saved-error', role: 'alert' }, ui.error),
      items.length ? h('ul', { class: 'list' }, items.map(itemRow)) : h('p', { class: 'note' }, t('saved.empty')),
    ];
  }, { initialFocus: '#save-name' });
}

/** Clipboard first; if it fails, show the link in a read-only field. */
export async function shareLink(config) {
  const url = shareUrl(config);
  try {
    await navigator.clipboard.writeText(url);
    showToast(t('toast.linkCopied'));
  } catch (error) {
    console.warn('flux-rc: clipboard unavailable', error);
    openDialog(t('share.title'), () => {
      const field = h('input', { type: 'text', class: 'readonly-link', readOnly: true, value: url, 'aria-label': t('share.field'), onfocus: (e) => e.target.select() });
      return [h('p', { class: 'hint' }, t('share.hint')), field];
    }, { initialFocus: 'input' });
  }
}
