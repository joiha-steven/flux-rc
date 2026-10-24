// Issues by path. Slots ([data-issues]) show the issues whose path matches them most closely;
// slots marked data-badge show a small "!" dot instead of text (mode tiles).
import { h } from './dom.js';
import { t, has } from './i18n.js';

const RANK = { error: 3, warning: 2, info: 1 };

/** The issue's text in the current locale, by its code; core's English message if the code has no key. */
export const issueText = (issue) => (has(`issue.${issue.code}`) ? t(`issue.${issue.code}`) : issue.message);

export const issueNode = (issue) =>
  h('p', { class: `issue issue-${issue.severity}` }, h('b', {}, t(`issue.severity.${RANK[issue.severity] ? issue.severity : 'info'}`)), issueText(issue));

export function paintIssues(issues) {
  const slots = [...document.querySelectorAll('[data-issues]')];
  const paths = [...new Set(slots.map((s) => s.getAttribute('data-issues')))];
  const byPath = new Map(paths.map((p) => [p, []]));
  for (const issue of issues) {
    const path = issue.path || '';
    const best = paths.filter((p) => path === p || path.startsWith(`${p}.`)).sort((a, b) => b.length - a.length)[0];
    if (best !== undefined) byPath.get(best).push(issue);
  }
  for (const slot of slots) {
    const list = byPath.get(slot.getAttribute('data-issues'));
    if (!slot.hasAttribute('data-badge')) { slot.replaceChildren(...list.map(issueNode)); continue; }
    const worst = list.sort((a, b) => RANK[b.severity] - RANK[a.severity])[0];
    slot.replaceChildren(...(worst ? [h('span', { class: `issue-dot issue-${worst.severity}`, title: list.map(issueText).join(' ') }, '!')] : []));
  }
}

let source = () => [];
/** Tell issues.js where the current issues come from, so late-built slots (dialogs) can repaint. */
export const setIssueSource = (fn) => { source = fn; };
export const repaint = () => paintIssues(source());
