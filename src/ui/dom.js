// Tiny DOM helpers. No framework: build elements with h(), keep focus across re-renders.
let counter = 0;
export const uid = (prefix = 'id') => `${prefix}-${++counter}`;

const PROPS = new Set(['checked', 'disabled', 'readOnly', 'hidden']);

/** h('div', { class: 'x', onclick: fn, 'data-k': 'a' }, child, 'text', [more]) */
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  let value;
  for (const [key, val] of Object.entries(props || {})) {
    if (val === undefined || val === null || val === false) continue;
    if (key === 'class') el.className = val;
    else if (key === 'value') value = val;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), val);
    else if (PROPS.has(key)) el[key] = val;
    else el.setAttribute(key, val === true ? '' : String(val));
  }
  append(el, kids);
  if (value !== undefined) el.value = value; // after children, so <select> options exist
  return el;
}

function append(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
}

/** Run a re-render and put focus back on the control with the same data-k. */
export function keepFocus(root, render) {
  const active = document.activeElement;
  const key = active && root.contains(active) ? active.getAttribute('data-k') : null;
  render();
  if (key) {
    const again = [...root.querySelectorAll('[data-k]')].find((n) => n.getAttribute('data-k') === key);
    if (again) usable(again).focus({ preventScroll: true });
  }
}

/** A disabled control cannot hold focus (it would drop to <body>); use its enabled neighbour, then its row. */
function usable(el) {
  if (!el.disabled) return el;
  const enabled = (scope) => scope && [...scope.querySelectorAll('[data-k]')].find((n) => !n.disabled);
  return enabled(el.parentElement) || enabled(el.closest('li')) || el;
}

/** Mount a section: build(config) returns nodes; live (slider) updates skip the rebuild. */
export function mountSection(root, store, build) {
  const draw = () => keepFocus(root, () => root.replaceChildren(...build(store.get()).flat(Infinity).filter(Boolean)));
  store.subscribe((_config, meta) => { if (!meta.live) draw(); });
  draw();
}

/** Slot for inline issues; paintIssues() fills it by path. */
export const issueSlot = (path) => h('div', { class: 'issues', 'data-issues': path });
