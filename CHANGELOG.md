# Changelog

What changed on https://flux-rc.stevensdesk.com/, newest first. Dates are when the change went live.
The full history is in the git log.

## 2026-10-31

### Added
- PIN guide page (`/guide/`, and one per language): every Lux-RC 371 v1 and v2 PIN, how to enter one
  with the tail switch, and what the light flashes back. Linked from the topbar and the PIN step.

### Changed
- README screenshots and the link preview image (`og.jpg`) retaken from the current page.
- Docs brought up to date: nine languages, the start-up sequence, the header, glossary terms.

## 2026-10-30

### Added
- Intro line at the top: which custom flashlights the page is for (Lux-RC 371D, 371 v2.0 and
  372 v2.0 light engines, such as the Oveready TorchLAB BOSS 35/70, Future BOSS and Lux-RC Minion).
  The page title, description and link previews name them too.
- Get ready step: the lens goes flat on the screen, centred on the square. On phone-sized screens, a
  tip to lay the phone flat and stand the light head-down on the square.

### Changed
- Phone layout of the topbar: language and theme as one pair beside the wordmark, the intro line at
  full width, Presets and Saved as labelled keys instead of bare icons. The language menu stays on screen.
- About text: not affiliated with Oveready either.

### Fixed
- Safari: switching to any language other than English showed "flux-rc couldn't load".
- A page that starts slowly is no longer replaced by the "couldn't load" message; the message now sits
  above the page and goes away once it has loaded.
- Cloudflare preview builds for branches other than `main` failed before they started.

## 2026-10-25

### Added
- Languages: Vietnamese, German, Japanese and Simplified Chinese, then Russian, Traditional Chinese,
  Korean and Spanish (nine in all), each on its own URL. `/` follows the browser's language.
- Camp, Simple and Power quick presets (six in all).
- Light theme. The page follows the browser's setting until the theme button is pressed.
- Search and sharing: sitemap, robots.txt, link preview image and structured data.

### Changed
- Moved from GitHub Pages to Cloudflare at flux-rc.stevensdesk.com (the old address redirects).
- The PIN rhythm is shown as a timeline, and the final cue is a hold with a countdown.
- New look: raised keys, recessed windows and tile strips. Tiles lead with the power (8.3 mW, 17 W).
- English wording: clearer Program steps and consistent terms.

## 2026-10-24

### Added
- First release. Four modes each for one cell and two cells, picked from a grid of every level with
  its brightness and power; behaviour and advanced settings; vendor and quick presets; saved setups
  and share links.
- Step-by-step programming with a beeping PIN rhythm guide for McClicky and MOFF switches, and the
  tailcap method for button-port e-switches.
- The flashing square reproduces the original Lux-RC NXS R1 programmer's GIFs byte for byte
  (checked against ten recordings).
