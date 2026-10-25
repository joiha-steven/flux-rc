# Translating flux-rc

Every word the page shows or reads aloud is in this folder. `en.js` is English and the source of
truth; other languages translate its keys.

## Add a language

1. Copy `en.js` to `<code>.js`, using the language code (`vi.js`, `de.js`, `zh-Hans.js`, `zh-Hant.js`).
2. Translate the values. Leave the keys as they are. A key you leave out falls back to English, so
   you can translate in parts.
3. In `src/ui/i18n.js`, add the language to `LANGUAGES` (code, its own name, the short label for
   the topbar button, and `path`, its URL folder). If browsers use other tags for it, extend `matchTag`.
   Only the chosen language is downloaded (`import()`).
   Each language has its own page, so also:
   - add the code and folder to `paths` (and the tag matching, if needed) in the "Language redirect"
     inline script near the top of `index.html`; `test/language.test.js` checks it against `pickLanguage`;
   - add a `hreflang` `<link rel="alternate">` for it to the set in `index.html`;
   - add a `<url>` with the full set of `xhtml:link` alternates to `sitemap.xml`;
   - run `npm run pages` to generate `<path>/index.html` (`scripts/build-pages.mjs` reads `LANGUAGES`,
     so the generator needs no edit) and commit it.
4. For a script the bundled fonts do not cover, add a `html:lang(<code>)` font stack in
   `styles/tokens.css` (see `ja`, `zh-Hans`, `zh-Hant`, `ko`). Vietnamese diacritics and Cyrillic are in the bundled Plum fonts
   (`assets/fonts/`, `styles/fonts.css`); a new script needs its own `@font-face` subset or a system stack.
5. `npm test` checks that `LANGUAGES` and the files in `locales/` match.

Each language has its own URL (`/vi/`, `/de/`, `/ja/`, `/zh/`, `/zh-hant/`, `/ru/`, `/ko/`, `/es/`; English is `/`). The page's `<html lang>`
decides the language shown. The language button in the topbar saves the choice in `localStorage`
(`flux-rc:lang`) and goes to that URL. Only on `/`, a script in `index.html` redirects to the saved
choice, else to the first of the browser's languages that matches.

After editing `en.js`, another locale or `index.html`, run `npm run pages`: the pages in `vi/`, `de/`,
`ja/`, `zh/`, `zh-hant/`, `ru/`, `ko/` and `es/` are generated from them and committed, and `npm test` fails while they are stale.

## Keys

Keys are dotted and grouped by where the text appears: `topbar.presets`, `behaviour.memory.hybrid`,
`program.pin.start`, `issue.no-thermal-limit`. The comments in `en.js` say which part of the page
each group belongs to. `issue.*` keys use the issue codes from `src/core/validate.js`.

## Placeholders

`{name}` is filled in by the page: `'Loaded “{name}”.'` becomes `Loaded “My light”.`

- Never translate or rename what is inside the braces. Keep every placeholder the English text
  has, and add none. Move them wherever your grammar needs them.
- Some placeholders are a piece of page markup, not text: `{link}` in `about.p1` and `about.p2` is
  the link (its words are in `about.p1.link` / `about.p2.link`), `{loop}` in `footer.perLoop` is
  the bold loop time, `{careful}` in `advanced.warning` is the bold word from `advanced.careful`.

## Strings built from pieces

Some text is put together from several keys, so check the pieces read well side by side:

- Mode labels: `mode.withDetail` joins `mode.level` (or `mode.afterburning`) with `mode.detail`;
  `mode.signalFull` joins the colour, flashes (`single` / `double`) and two durations.
- `theme.switchToLight` / `theme.switchToDark` name what the theme button does when clicked.
- `program.run.announceBeep` / `announceFlash` use `program.switch.*.verb` (press / release).
- `footer.blocked` and `footer.downloadOff` end with an issue message (`issue.*`);
  `footer.blockedUnknown` is the fallback sentence for that slot.
- Numbers (`{n}`, `{percent}`, `{frames}`, `{digits}`) arrive as English-style digits with a dot
  for decimals ("0.4"). There is no plural support: `packet.meta` always has many frames, and
  `program.run.progress` counts "1 of 3", so phrase them to work for any number.

## Units

Keep units such as `ms`, `s`, `W`, `mW`, `°C` and `°F` unless your language writes them
differently (then follow the local convention, e.g. a space or comma). Brightness values such as
`120 mW` come from the protocol tables and are not translated. Vendor preset names
(`vendorPreset.*.name`, such as "FL33 v4 Factory Prog") are the vendors' own program names; keep
them unless a translation is clearly better.

## Not in this folder

`index.html` holds the English text; the generator copies each language's text into its own page, so it shows without JavaScript. The `<noscript>`
message and the "couldn't load" message (keys `boot.*`) cannot be translated, because they run
before any module loads.

## Known gaps for the first translation

- `a11y.listSeparator` joins spoken lists. The mode picker still builds each cell's screen-reader
  name by replacing the English `' · '` in `mode.withDetail` / `mode.detail` with it, so a locale that
  uses another separator in those strings would need that changed in `src/ui/render/picker.js`.
- `src/data/presets.js` and `src/data/quick-presets.js` import `src/ui/i18n.js` for preset names.

## Test

```bash
npm test
```

`test/i18n.test.js` checks that every locale uses only keys that exist in `en.js` and the same
`{placeholders}` per key, that every key the code uses exists, and that `index.html` matches
`en.js`. Then run `npm run serve`, open http://localhost:8080 and read every screen, including the
Program steps, dialogs and error messages, at a phone width: translations are often longer than
English.
