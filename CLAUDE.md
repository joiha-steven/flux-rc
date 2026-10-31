# flux-rc — rules for agents

Read `README.md` first, then the doc for the part you touch: `docs/protocol.md` (core),
`docs/config-model.md` (config object), `docs/design.md` (UI).

## Language

Everything in this repo is English: code, identifiers, comments, commit messages, docs, UI text,
file names, test names. No exceptions.

## Constraints

- No dependencies, no build step, no framework. Plain HTML, CSS and ES modules. Node only runs
  tests (`node --test`) and the page generator. The language pages (`vi/`, `de/`, `ja/`, `zh/`, `zh-hant/`, `ru/`, `ko/`, `es/`) are
  generated from `index.html` and `locales/` by `npm run pages` and committed; edit those two,
  never the generated files, and rerun the script (a test fails when they are stale).
  The PIN guide pages (`guide/` is English and the template; `*/guide/` are generated) come from `guide/index.html` and
  `locales/guide/` by `npm run guide`: same rule, edit the sources and rerun.
- No external requests at runtime: no CDNs, web fonts, analytics or trackers.
- `src/core/` has no DOM access and is fully covered by tests.
- Keep files small (aim for under 300 lines). Split by responsibility.
- User-visible text lives in locales/en.js; never hard-code UI strings.

## The protocol is fixed by recordings

`test/fixtures/` holds GIFs and decoded fields recorded from the original programmer on
2026-10-24. The encoder must reproduce every fixture GIF byte for byte. Never edit a fixture or
relax a test to make it pass; if a rule seems wrong, report it with evidence instead.

## Checks before calling something done

- `npm test` is green.
- UI changes: serve with `npm run serve`, check widths 375, 768 and 1440 in both colour schemes,
  run `~/.claude/tools/do-giao-dien.js` on the page at each width and fix what it reports (or give a
  reason per item), then take one screenshot per width.
