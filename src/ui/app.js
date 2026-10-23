// Bootstrap: load the config, mount sections, wire header buttons and summary actions.
import { defaultConfig, normalizeConfig } from '../core/index.js';
import { createStore } from './state.js';
import { loadAutosave, autosave } from './storage.js';
import { hasShare, decodeShare } from './share.js';
import { derive } from './derive.js';
import { paintIssues, setIssueSource } from './issues.js';
import { showToast } from './toast.js';
import { openPresets, openSaved, shareLink } from './dialogs.js';
import { createProgramScreen } from './program-screen.js';
import { mountQuick } from './render/quick.js';
import { mountGroups } from './render/groups.js';
import { mountBehaviour } from './render/behaviour.js';
import { mountAdvanced } from './render/advanced.js';
import { mountFooter } from './render/footer.js';

const $ = (id) => document.getElementById(id);

const BAD_LINK = 'This link could not be read';

/** Reads and strips a #c= share link. Returns { config } or { error }, or null when there is none. */
function takeShare() {
  if (!hasShare(location.hash)) return null;
  const hash = location.hash;
  history.replaceState(null, '', location.pathname + location.search);
  try {
    return { config: decodeShare(hash) };
  } catch (error) {
    console.warn('flux-rc: bad share link', error);
    return { error };
  }
}

const firstShare = takeShare();
function initialConfig() {
  if (firstShare?.config) return firstShare.config;
  return loadAutosave() || normalizeConfig(defaultConfig());
}

function downloadGif(program) {
  const url = URL.createObjectURL(new Blob([program.gif], { type: 'image/gif' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: 'flux-rc.gif' });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const store = createStore(initialConfig());
const screen = createProgramScreen($('program'), $('app'));

mountQuick($('quick'), store);
mountGroups($('groups'), store);
mountBehaviour($('behaviour'), store);
mountAdvanced($('advanced-body'), store);
mountFooter({
  footer: $('footer'), strip: $('issues-strip'), panel: $('advanced-body'), store,
  actions: {
    program: () => { const d = derive(store.get()); if (d.canProgram) screen.open(d.program); },
    save: () => openSaved(store),
    share: () => shareLink(store.get()),
    download: () => { const d = derive(store.get()); if (d.program) downloadGif(d.program); },
  },
});

let paintFrame = 0;
setIssueSource(() => derive(store.get()).issues);
const paint = () => paintIssues(derive(store.get()).issues);
store.subscribe((_c, meta) => {
  if (meta.live) { cancelAnimationFrame(paintFrame); paintFrame = requestAnimationFrame(paint); } else paint();
});
let saveTimer = 0;
store.subscribe((config) => { clearTimeout(saveTimer); saveTimer = setTimeout(() => autosave(config), 300); });
paint();
// Tells the boot guard in index.html that the first render worked.
document.documentElement.setAttribute('data-ready', '');

// A config that came from a share link is saved straight away: the #c= part is already gone from
// the address bar, so without this a reload would bring back the previous config.
if (firstShare?.config) autosave(firstShare.config);
if (firstShare?.error) showToast(BAD_LINK);

// Pasting a share link into an open tab only changes the hash.
window.addEventListener('hashchange', () => {
  const shared = takeShare();
  if (!shared) return;
  if (shared.error) { showToast(BAD_LINK); return; }
  const before = store.get();
  store.replace(shared.config);
  autosave(shared.config);
  showToast('Loaded the shared setup.', { label: 'Undo', onClick: () => store.replace(before) });
});

$('btn-presets').addEventListener('click', () => openPresets(store));
$('btn-saved').addEventListener('click', () => openSaved(store));
