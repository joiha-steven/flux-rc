# UI design

flux-rc is one static page. No accounts, no server, no build step. Everything is stored in the
browser.

**Visual reference: [`design-reference.jpg`](design-reference.jpg).** Match its look: layout,
spacing, type, tile photos, colours. Its numbers are placeholders and partly wrong: real levels are
1–32 and every %/W label must come from `LEVELS` / `describeMode` in `src/core/`.

The structure deliberately follows the original lux-rc programmer (battery group, row of four mode
tiles with up/down arrows, row of option tiles, locked advanced section, Program button), so people
who know that page feel at home.

## Principles

- **Light and dark.** The page follows the browser (`prefers-color-scheme`); a topbar button
  overrides it (see Theme). Tile photos are dark in both themes, so text drawn on them stays light.
- **The Program screen is always dark**, in both themes: people hold the light up to a dark
  screen in a dim room, and the flashing square sits on black. `.program` pins `color-scheme: dark`.
- **One screen, top to bottom**, in the same order as the original.
- **Plain words.** "Level 21 · 10 % · 3 W", "Starts in the last mode used". Raw field numbers only
  in Packet details.
- **Dangerous settings are opt-in.** Vendor safety settings sit in the collapsed Advanced section
  and default to "Keep current".

## Tokens

Each colour is declared once as `light-dark(light, dark)` in `styles/tokens.css`.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | `#f6f4f0` | `#0b0c0e` | page |
| `--surface` | `#ffffff` | `#131518` | cards, bars |
| `--surface-2` | `#ebe8e1` | `#1a1d21` | hover, pressed |
| `--line` | `#d4cfc5` | `#2a2e34` | 1 px borders (decorative, not text) |
| `--text` | `#1b1a18` | `#ece9e4` | main text |
| `--muted` | `#625e57` | `#8d9097` | secondary text |
| `--accent` | `#ffb547` | `#ffb547` | amber FILL: buttons, selected pills, numbers on photos |
| `--on-accent` | `#1a1205` | `#1a1205` | text on amber |
| `--accent-strong` | `#945400` | `#ffb547` | amber as text, border or focus ring on the page: wordmark, links, focus, selected card |
| `--danger` | `#c0272d` | `#ff6b6b` | errors |
| `--ok` | `#17703d` | `#5bd68a` | success |
| `--scrim`, `--shadow`, `--accent-glow` | translucent ink | translucent black / amber | dialog backdrop, toast shadow, afterburning glow |
| `--photo-text`, `--photo-muted` | `#ece9e4`, `#b4b7bd` | same | text and borders drawn on beam photos |

Contrast (WCAG AA, 4.5:1 for text): light `--text` 15.8 on bg and 17.4 on surface, `--muted` 5.9 / 6.5
(5.3 on surface-2), `--accent-strong` 5.4 / 6.0 (4.9 on surface-2); dark `--text` 16.2 / 15.1,
`--muted` 6.1 / 5.7, `--accent` 11.1 / 10.4. Use `--accent` only as a fill with `--on-accent` ink;
use `--accent-strong` wherever amber is text or an outline.

Colours that stay literal on purpose: the flashing square (protocol), the Program screen, and
gradients and text shadows over the beam photos.

### Theme

One icon button in the topbar (`#btn-theme`) cycles Auto, Light, Dark, Auto; the icon shows the
current choice (half-filled circle, sun, moon) and the label says what a click does. The choice is
stored in `localStorage` under `flux-rc:theme` ("light" or "dark"; missing means auto) and set as
`<html data-theme>`. A small inline script in `<head>` applies it before the stylesheets paint, so
there is no flash. If storage fails the toggle still works for the current page view.
Logic: `src/ui/theme.js`.

Radius 12 px on cards and tiles, 8 px on buttons. 8 px spacing grid. Content max width 1080 px,
centred, 24 px gutters (16 px on phones).

## Typography

Fonts are self-hosted from `assets/fonts/` via `styles/fonts.css` (load it first):

- **Plum Sans** (Inter-based) for all text. `font-family: "Plum Sans", system-ui, sans-serif`.
- **Plum Mono** (JetBrains Mono-based) only where a number or code is the point: the wordmark,
  level numbers and short codes on tiles, the %/W line on tiles, loop time, Packet details, PIN
  digits. Not for subtitles or descriptions. Note its 400 weight already renders fairly heavy.

Scale (px, line height): caption 12/16, small 13/18, body 15/22, title 18/24 (section headings),
display 24/28 (dialog titles), tile number 40/1 desktop and 32/1 phone.
Weights: 400 body, 500 labels and buttons, 600 headings. Nothing bolder.
Letter spacing: -0.01em on 18 px and up; +0.02em on the wordmark; 0 elsewhere. No all-caps text
except the tiny "LVL" (11 px, +0.08em, muted).
Numbers use tabular figures (`font-variant-numeric: tabular-nums`) everywhere they can change.

What makes a page look machine-made, and must be avoided: everything in the same size and weight,
monospace used as decoration, centred text in cards, pills everywhere, uneven gaps. Use one left
edge per section, consistent 8 px rhythm, and let size and weight (not colour) carry hierarchy.

## Assets (`assets/`)

| File | Use |
|------|-----|
| `beam-moonlight.webp` | Red moonlight |
| `beam-low.webp` | Levels 1–12 |
| `beam-medium.webp` | Levels 13–20 |
| `beam-high.webp` | Levels 21–26 |
| `beam-max.webp` | Levels 27–32 |
| `beam-afterburning.webp` | Afterburning |
| `beam-strobe.webp` | 10 Hz strobe, S.O.S., white custom signals |
| `beam-beacon.webp` | Red beacon, red custom signals |
| `battery-1s-li-ion.webp`, `battery-2s-li-ion.webp`, `battery-2s-cr123a.webp` | Group headers (transparent) |
| `trail.webp` | Background of the Program "Prepare" step, heavily dimmed |

Within one beam band, neighbouring levels must still look different: apply a CSS
`filter: brightness()` from about 0.6 (lowest level of the band) to 1.0 (highest). Tile photos are
portrait; use `object-fit: cover` with `object-position: center 65%` so the lit trail stays in view.

## Layout

| Width | Layout |
|-------|--------|
| < 768 px (phone) | Mode tiles 2 × 2, option cards 2 × 2, sticky bottom bar with loop time and Program. |
| 768–1199 px (tablet) | Desktop layout, four tiles per row, slightly smaller tiles. Sticky bottom bar. |
| ≥ 1200 px (desktop) | As the reference: four tiles per row with arrows, footer bar at the end of the page (not sticky). |

### Header

Wordmark "flux-rc" (amber, monospace, letter-spacing 0.15em), subtitle "NXS R1 optical programmer"
in muted monospace. Right: outline buttons "Presets" and "Saved" with icons (labels may hide below
400 px; keep accessible names).

### Quick start

Three pill buttons in a row: Everyday, Tactical, Gentle (`QUICK_PRESETS`). The one equal to the
current config is filled amber; the others are outline. One tap loads it with an Undo toast. Under
the row, one muted line: the description of the selected quick preset (or nothing).

### Mode groups ("One cell", "Two cells in series")

Header row: battery image (about 80 × 24 px), title, monospace subtitle ("1 × 18650 Li-ion",
"2 × 18650 Li-ion (series)" or "2 × CR123A (series)"). Right side: a switch "Use" and, for two
cells, a segmented control "2 × Li-ion" / "2 × CR123A".

When a group is off, replace its tiles with one muted line: "Not used. This set copies the
one-cell modes." (or two-cell, or "Modes stay as they are on the light" when both are off).

**Mode tile** (aspect about 1.3 : 1 on desktop/tablet, 1 : 1 on phone):

- Beam photo filling the tile, with a dark gradient at top and bottom for legible text.
- Top left, monospace: "0.4 % · 120 mW" (or the special mode's name, e.g. "Afterburning 100 % ·
  30 W", "Red moonlight", "10 Hz strobe", "S.O.S.", "Red beacon", "Signal · white ×2").
- Top right: slot number badge 1–4 (small square, border).
- Bottom left: small "LVL" then the level number large, amber, monospace. Special modes show a
  short code instead: AB, RM, SOS, STB, BCN, SIG.
- Right edge: up and down chevron buttons (visually 28–32 px, hit area at least 44 × 44 px). Up =
  next entry in the list below, down = previous. List order: (Not used, slots 2–4 only), Red
  moonlight, levels 1–32, Afterburning, S.O.S., 10 Hz strobe, Red beacon, Custom signal.
- Afterburning tile: 2 px amber border and a soft amber glow.
- Not used: dashed border, no photo, centred muted "Not used" and a "+" hint.
- Inline issues (from `validateConfig` by path) as a small red or amber badge on the tile; the full
  text appears in the issues strip above the footer.
- Tapping the tile body opens the **mode picker**: dialog on desktop/tablet, bottom sheet on phone.
  It is a **grid, not a list**, so the whole choice fits on one screen without scrolling (phone may
  scroll a little):
  - **Brightness levels** first: 32 square-ish cells, 8 columns on desktop/tablet (dialog about
    760 px wide), 4 columns on phone. Each cell is a tiny beam photo (the `-thumb` file of its band,
    with the same `brightness()` rule as the tiles) darkened at the bottom, the level number large
    in Plum Mono top-left, and the power ("3 W", "180 mW") small at the bottom-left. The % is not
    printed in the cell.
  - **Other modes** below, under a small heading: Afterburning, Red moonlight, S.O.S., 10 Hz strobe,
    Red beacon, Custom signal, and Not used (slots 2–4 only). Wider cells (4 per row desktop, 2 per
    row phone) with their photo, name, and one short detail line ("100 % · 30 W", "Distress
    pattern").
  - The current choice has a 2 px amber border; hover/focus show a lighter border.
  - A detail bar pinned at the bottom of the picker shows the hovered/focused/current entry in full:
    "Level 21 · 10 % · 3 W". On touch it shows the current entry.
  - Arrow keys move focus within the grid (roving focus), Enter/Space chooses, Escape closes.
  - Choosing "Custom signal" reveals its controls (colour, single/double, on time, off time) under
    the grid, inside the picker; choosing anything else closes the picker.
  - Every cell has an accessible name with the full text ("Level 21, 10 %, 3 W").

Desktop and tablet: small arrows between tiles and a thin return line under the row from tile 4
back to tile 1 (as in the reference). Phone: no arrows; the badges show the order.

### Behaviour

Four equal cards in a row (2 × 2 on phone): icon (inline SVG, 1.5 px line style), current state as
the label ("Hybrid memory", "Li-ion protection on", "Battery stretch on", "Bounce sensor: keep
current"), chevron on the right. Tapping opens a small dialog/sheet with the choices:

- Memory: No memory / Standard / Hybrid, each with its one-line explanation.
- Li-ion protection: On / Off (Off warns "Only use protected cells").
- Battery stretch: On / Off with the runtime-versus-constant-output explanation.
- Bounce sensor: Keep current / Not in use / Set, with the sensitivity slider (Low … High, Normal marked).

### Footer

One bar (card style): left, the Advanced toggle row ("Advanced (vendor safety settings)" with a
lock icon and chevron); right, "20.6 s per loop" in monospace, a "More" icon button (menu: Save,
Share link, Download GIF, Packet details) and the amber Program button with a play icon.

Expanding Advanced opens a panel above the footer bar: the warning banner, then the settings
(switch timeout, thermal cutoff with °C and °F, one-cell limit, two-cell limit, PIN digits), each
"Keep current" / "Set" (plus "No limit" where it exists).

Issues strip: when there are warnings or errors, a compact list directly above the footer. An
error disables Program and the button's accessible description says why.

On phone and tablet the loop time, More and Program sit in a sticky bottom bar instead; the
Advanced row stays in the page flow.

## Program screen

Full-screen overlay.

1. **Prepare**: `trail.webp` as a background, darkened to about 20 % brightness, with a card on top:
   toggle "Electronic switch" / "Clicky switch" and the matching steps, then three tips as plain
   text with a small icon each (screen at full brightness, dark room, light close to the square).
   The tips are not controls: no switches or checkboxes, nothing to tick. Buttons Start and Cancel.
   - Electronic switch: disconnect the battery, reconnect it while holding the button, keep
     holding; programming mode starts after about three seconds.
   - Clicky switch: enter the PIN (public PIN 222, or the one from your vendor) as short clicks
     with a one-second pause between digits, wait one second, switch on. A dim red light means the
     PIN was accepted.
2. **Flashing**: pure black, the GIF centred at 300 × 300 CSS px (shrink only if the viewport is
   smaller), small dim text above ("Hold the light against the square. It takes 10–20 seconds; the
   red light goes off when it is done."), dim Restart and Done below. Request fullscreen and a
   screen wake lock on Start; release both on Done or Escape.

## Presets and saved configs

- **Presets** dialog: "Quick start" (the three) at the top, then the vendor presets. Loading
  replaces the config with an Undo toast.
- **Saved** dialog: list from `localStorage` (name, date), Load, Rename, Delete with confirm,
  "Save current". Long names truncate with an ellipsis. Empty state: "Nothing saved yet".
- **Share link**: copies a URL with `#c=` + base64url JSON; opening it loads the config through
  `normalizeConfig`; a bad link shows "This link could not be read". Clipboard failure shows the
  link in a read-only field.
- If `localStorage` is unavailable, Saved explains it and everything else keeps working.

## Accessibility

Tap targets at least 44 px, visible amber focus ring, labels on every control, dialogs with
`role="dialog"`, focus moved in and restored on close, Escape closes. Respect
`prefers-reduced-motion`. Tile photos are decorative (`alt=""`); the tile's accessible name is its
text ("Mode 2: level 19, 4.6 %, 1.4 W").

## States to check

Widths 375, 768 and 1440. Both groups off; one group off; only slot 1 used; all slots used; an
afterburning tile; a custom signal tile; an error (custom signal 250 ms on + 32 ms off) disabling
Program; Advanced open; mode picker open; Saved empty and with a very long name; Program screen
(both steps); no `localStorage`.

## Wording (checked against the original programmer)

Use the original's terms so people who know lux-rc recognise every setting:

| Setting | Name in flux-rc | Notes to show |
|---------|-----------------|---------------|
| Field 14 | **Bounce sensor** (not "tap sensor") | Options: Keep current, Not in use ("The bounce switch is not active"), Set sensitivity (Low 50 … High 100, Normal about 85). |
| One-cell group | One cell | "The 371D light engine limits the peak battery current to about 5 A, so one-cell output is normally capped at 17 W (level 28). Vendors can change this." |
| Two-cell group | Two cells in series | "Higher levels draw more current. Make sure your cells can deliver it; too much current can make a cell fail or catch fire." |
| Field 11 | One-cell output limit | Levels 29–31: "Overboost: these levels may not run stable." Factory default 28. |
| Field 12 | Two-cell output limit | No limit: "All modes allowed with two cells, including afterburning." |
| Field 10 | Thermal cutoff | No limit: "The light engine can reach 120 °C, which is extremely dangerous for any lithium cell." Say "light engine", not "driver". |
| Field 13 | Programming PIN | The PIN entered with a clicky switch before programming. Keep current = "Leave the PIN as it is". |
| Battery stretch | Battery stretch | On: "Greatly extends runtime and battery life." Off: "Shorter runtime, but constant output." |
| Li-ion protection | Lithium-ion protection | Off: "Use this only with protected cells." |
| S.O.S. | S.O.S. | In the picker: "Distress pattern per 46 CFR 161.013-7." |
| Custom signal | Custom signal | Red or white, single or ×2, on 64 ms or 1/4 s, off 32 ms, 1/4 s, 1 s or 3 s. |

Program screen, extra guidance from the original:

- Electronic switch: "Disconnect the battery and wait a moment so the driver resets. Press and
  hold the button while you reconnect the battery. Don't release it: programming mode starts in
  about three seconds."
- Clicky switch: "Enter the PIN as short clicks with a one-second gap between digits. After the
  last digit, wait one second, then switch the light on. A dim red light means the PIN was
  accepted."
- After the steps: "Programming takes 10–20 seconds and the red light goes off when it's done.
  If it doesn't, try again; a second attempt is sometimes needed."
- Tips (plain text with icons, not controls): screen brightness at maximum; daylight or bright
  room light can overexpose the sensor, so find a dark place; hold the light as close to the square
  as possible.

## Performance

The page must feel instant on a phone on a mobile network. No build step, so:

- `<link rel="modulepreload">` in `index.html` for every module the page imports at startup, so
  they download in parallel instead of one import level at a time.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` for both font files.
- Tile `<img>`: explicit `width`/`height` (no layout shift), `decoding="async"`, and
  `fetchpriority="high"` only for the first group's four tiles. The mode picker uses the
  `beam-*-thumb.webp` files (96 px wide), not the full tiles.
- `trail.webp` loads only when the Program screen opens.
- No work on the main thread at startup beyond rendering the current config; build the GIF only
  when it is needed (Program, Download GIF, Packet details, loop time may use frame durations
  without building the GIF bytes).
