// The rhythm timeline on step 3: the PIN schedule drawn as a strip, like the timing diagram in the
// Lux-RC manual. Count-in beats are dots, clicks are short raised blocks as wide as their on-time,
// and the end is one long block: switch on and keep it on until the flashing begins. On the setup
// screen it is a preview; during the run a playhead follows the run's clock.
import { h } from './dom.js';
import { buildPinSchedule, timelineSegments, segmentAt, GIF_START_DELAY_MS } from './pin-rhythm.js';
import { t } from './i18n.js';

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Screen-reader text: "Count-in, 2 clicks, pause, 2 clicks, pause, 2 clicks. Then: Switch on and leave it on." */
function describe(digits, final) {
  const groups = digits.map((n) => t(n === 1 ? 'program.timeline.click' : 'program.timeline.clicks', { n }));
  const clicks = groups.join(`, ${t('program.timeline.pause')}, `);
  return t('program.timeline.desc', { clicks, final });
}

/**
 * @param {{ holdLabel: string, final: string }} words the switch type's label under the hold block
 *   ("ON · keep it on") and its final cue, for the screen-reader description
 * @returns {{ el: HTMLElement, show(digits: number[]|null, speed: string): void, play(clock): () => void }}
 *   show draws the strip for a PIN (hidden when digits is null); play moves the playhead on
 *   clock.elapsed() until the returned stop function is called.
 */
export function rhythmTimeline({ holdLabel, final }) {
  const bar = h('div', { class: 'rhythm-bar' });
  const head = h('span', { class: 'rhythm-head' });
  const label = h('p', { class: 'rhythm-label' }, holdLabel);
  const desc = h('p', { class: 'sr' });
  const el = h('div', { class: 'rhythm' }, h('div', { class: 'rhythm-drawing', 'aria-hidden': 'true' }, h('p', { class: 'rhythm-title' }, t('program.timeline.title')), bar, label), desc);
  let pieces = [];
  let nodes = [];

  function show(digits, speed) {
    el.hidden = !digits;
    if (!digits) return;
    pieces = timelineSegments(buildPinSchedule(digits, speed), GIF_START_DELAY_MS);
    nodes = pieces.map((p) => {
      const node = h('span', { class: `rhythm-piece is-${p.kind}` });
      node.style.left = `${p.start.toFixed(3)}%`;
      node.style.width = `${p.width.toFixed(3)}%`;
      return node;
    });
    bar.replaceChildren(h('span', { class: 'rhythm-base' }), ...nodes, head);
    desc.textContent = describe(digits, final);
  }

  /** Marks passed pieces, the current one, and the hold block as next during the last wait. */
  function mark(index) {
    nodes.forEach((n, i) => {
      n.classList.toggle('past', i < index);
      n.classList.toggle('now', i === index);
    });
    const last = nodes.length - 1;
    nodes[last]?.classList.toggle('next', pieces[index]?.kind === 'wait');
  }

  function play(clock) {
    el.classList.add('running');
    const stepped = reducedMotion();
    const totalMs = pieces.at(-1).endMs;
    let current = -2;
    let frame = 0;
    const draw = () => {
      const now = clock.elapsed();
      const index = segmentAt(pieces, now);
      if (index !== current) { current = index; mark(index); }
      // Reduced motion: jump to the start of each piece instead of gliding.
      const atMs = stepped ? (pieces[index]?.startMs ?? (index < 0 ? 0 : totalMs)) : now;
      head.style.left = `${Math.min(100, Math.max(0, (atMs / totalMs) * 100)).toFixed(3)}%`;
      if (index < pieces.length) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }

  return { el, show, play };
}
