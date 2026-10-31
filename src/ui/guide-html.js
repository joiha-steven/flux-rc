// The guide page as HTML strings, built from locales/guide/en.js and src/data/pins.js. No DOM, so
// scripts/build-guide.mjs can write it into guide/index.html (search engines and no-JS visitors then get the whole page).
// src/ui/guide.js only handles the v1/v2 switch afterwards.
import { PIN_GROUPS, PINS, SWITCH_COUNT, formatPin } from '../data/pins.js';
import { esc, iconSvg, patternSvg, timingSvg, boardSvg, answerVisual } from './guide-svg.js';

const question = (s, pin) => s.faqQuestion.replace('{pin}', pin.digits.join('')).replace('{board}', pin.boards.length === 2 ? s.faqBoth : s.faqV2);
const spaced = (digits) => digits.join(', ');
const boardTag = (list) => list.join(' ');

function boardCard(s, id, name, alias, facts, art) {
  return `<article class="g-card g-board is-${id}">
      <div class="g-board-head"><h3>${esc(name)}</h3><span class="g-tag">${s[id + 'Tag']}</span></div>
      <div class="g-board-body">${art}<p class="g-muted">${esc(alias)}</p></div>
      <ul class="g-facts">${facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    </article>`;
}

function boardsSection(s) {
  return `<section class="g-section" aria-labelledby="g-boards">
    <h2 id="g-boards">${esc(s.boardsTitle)}</h2>
    <div class="g-two">
    ${boardCard(s, 'v1', s.v1Name, s.v1Alias, s.v1Facts, boardSvg(1, 4, s.boardDrawing.replace('{n}', 4)))}
    ${boardCard(s, 'v2', s.v2Name, s.v2Alias, s.v2Facts, boardSvg(4, 8, s.boardDrawing.replace('{n}', 32)))}
    </div>
  </section>`;
}

function switchBar(s) {
  const opt = (value, label, checked) => `<label class="seg-opt"><input type="radio" name="board" value="${value}"${checked ? ' checked' : ''}><span>${esc(label)}</span></label>`;
  return `<div class="g-bar"><span class="g-bar-label">${esc(s.switchLabel)}</span>
    <div class="seg" role="radiogroup" aria-label="${esc(s.switchLabel)}">${opt('v1', s.v1Name, false)}${opt('v2', s.v2Name, true)}</div></div>`;
}

function enterSection(s) {
  return `<section class="g-section" aria-labelledby="g-enter">
    <h2 id="g-enter">${esc(s.enterTitle)}</h2>
    <div class="g-card g-enter">
      <div class="g-strip">${timingSvg(s)}</div>
      <ol class="g-steps">${s.enterSteps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
      <p class="g-muted">${esc(s.enterExample)}</p>
      <p class="g-tip">${esc(s.enterTip)}</p>
    </div>
  </section>`;
}

function dots(s, n) {
  const spans = Array.from({ length: SWITCH_COUNT }, (_, i) => `<span class="g-dot${i + 1 === n ? ' is-on' : ''}"></span>`).join('');
  return `<span class="g-dots" role="img" aria-label="${esc(s.switchDots.replace('{n}', n))}">${spans}</span>`;
}

function pinCard(s, pin) {
  const words = s.pins[pin.id];
  const both = pin.boards.length === 2;
  const clicks = s.clicks.replace('{digits}', spaced(pin.digits));
  return `<article class="g-card g-pin" id="${pin.id}" data-boards="${boardTag(pin.boards)}">
      <div class="g-pin-head"><h4 class="g-pin-digits">${formatPin(pin.digits)}</h4><span class="g-badge${both ? '' : ' is-v2'}">${both ? s.badgeBoth : s.badgeV2}</span></div>
      <p class="g-q">${esc(question(s, pin))}</p>
      ${patternSvg(pin.digits, clicks)}
      ${pin.alt ? `<p class="g-muted">${esc(s.alsoPin.replace('{pin}', formatPin(pin.alt)))}</p>` : ''}
      ${pin.sw ? dots(s, pin.sw) : ''}
      <p class="g-does">${esc(words.does)}</p>
      <div class="g-answer"><strong>${esc(s.answerLabel)}</strong>
        <div class="g-flash" aria-hidden="true">${answerVisual(pin, words, s.visual)}</div>
        <p>${esc(words.answer)}</p></div>
    </article>`;
}

function pinsSection(s) {
  const groups = PIN_GROUPS.map((group) => {
    const pins = PINS.filter((p) => p.group === group);
    const boards = [...new Set(pins.flatMap((p) => p.boards))];
    const info = s.groups[group];
    return `<div class="g-group" data-boards="${boardTag(boards)}">
      <div class="g-group-head">${iconSvg(group)}<h3>${esc(info.name)}</h3></div>
      <p class="g-muted g-group-note">${esc(info.blurb)}</p>
      <div class="g-grid">
      ${pins.map((p) => pinCard(s, p)).join('\n      ')}
      </div>
    </div>`;
  });
  return `<section class="g-section" aria-labelledby="g-pins">
    <h2 id="g-pins">${esc(s.pinsTitle)}</h2>
    ${groups.join('\n    ')}
    <div class="g-v1-only"><p class="g-card g-note">${esc(s.v1Note)}</p><p class="g-muted">${esc(s.v1Footer)}</p></div>
  </section>`;
}

function footer(s, home) {
  return `<footer class="g-section g-foot">
    <p>${esc(s.manualLead)} <a href="${s.manualUrl}" rel="noopener">${esc(s.manualLinkText)}</a></p>
    <p class="g-muted">${esc(s.disclaimer)}</p>
    <p><a class="g-back" href="${home}">${esc(s.backToProgrammer)}</a></p>
  </footer>`;
}

/** The header tagline: the programmer's own tagline (main locale `topbar.tagline`), so the header wraps and measures exactly like the programmer's and nothing moves between the two pages. */
export const taglineHtml = (main) => `<p class="tagline">${esc(main['topbar.tagline'])}</p>`;

/** Everything inside <main>. `home` is the programmer page in the same language ('/' for English, '/vi/' ...). */
export function mainHtml(s, home = '/') {
  return [
    `<section class="g-hero"><h1>${esc(s.h1)}</h1><p class="g-lead">${esc(s.lead)}</p></section>`,
    boardsSection(s), switchBar(s), enterSection(s), pinsSection(s), footer(s, home),
  ].join('\n  ');
}

/** JSON-LD: a HowTo for entering a PIN and a FAQPage with one question per PIN. */
export function jsonLd(s) {
  const howto = {
    '@type': 'HowTo', name: s.howtoName,
    step: s.enterSteps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
  };
  const faq = {
    '@type': 'FAQPage',
    mainEntity: PINS.map((pin) => ({
      '@type': 'Question', name: question(s, pin),
      acceptedAnswer: { '@type': 'Answer', text: `${s.pins[pin.id].does} ${s.pins[pin.id].answer}` },
    })),
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [howto, faq] }, null, 1).replace(/</g, '\\u003c');
}

/**
 * Invisible copies of the programmer's top-bar keys (Presets, Saved, PIN guide), kept only so the actions row is as wide as the
 * programmer's from 720 px: the tagline then wraps, and the language and theme keys sit, exactly as on the programmer page.
 * `main` is the main locale strings. The Program link shares a cell with them and sits at the right end, where PIN guide is.
 */
const ghost = (label) => `<span class="btn btn-outline"><svg width="20" height="20"></svg><span class="btn-label">${esc(label)}</span></span>`;
export const ghostsHtml = (main) => ['topbar.presets', 'topbar.saved', 'topbar.guide'].map((key) => ghost(main[key])).join('\n            ');
