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

- **Dark only.** People program in a dim room and the flashing square sits on black; the photo
  tiles are designed for a dark page. Set `color-scheme: dark`. There is no light theme.
- **One screen, top to bottom**, in the same order as the original.
- **Plain words.** "Level 21 · 10 % · 3 W", "Starts in the last mode used". Raw field numbers only
  in Packet details.
- **Dangerous settings are opt-in.** Vendor safety settings sit in the collapsed Advanced section
  and default to "Keep current".

## Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0b0c0e` | page |
| `--surface` | `#131518` | cards, bars |
| `--surface-2` | `#1a1d21` | hover, pressed |
| `--line` | `#2a2e34` | 1 px borders |
| `--text` | `#ece9e4` | main text |
| `--muted` | `#8d9097` | secondary text |
| `--accent` | `#ffb547` | amber: wordmark, level numbers, selected, Program |
| `--on-accent` | `#1a1205` | text on amber |
| `--danger` | `#ff6b6b` | errors |

Fonts: system sans for text; `ui-monospace, "SF Mono", Menlo, Consolas, monospace` for the
wordmark, subtitles like "1 × 18650 Li-ion", %/W labels and level numbers. No web fonts.
Radius 12 px on cards and tiles, 8 px on buttons. 8 px spacing grid. Content max width 1080 px,
centred, 24 px gutters (16 px on phones).

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
  It lists every entry with a small beam thumbnail, number, % and power; the current one is
  highlighted. Choosing "Custom signal" reveals its controls (colour, single/double, on time, off
  time) inside the picker.

Desktop and tablet: small arrows between tiles and a thin return line under the row from tile 4
back to tile 1 (as in the reference). Phone: no arrows; the badges show the order.

### Behaviour

Four equal cards in a row (2 × 2 on phone): icon (inline SVG, 1.5 px line style), current state as
the label ("Hybrid memory", "Li-ion protection on", "Battery stretch on", "Tap sensor: keep
current"), chevron on the right. Tapping opens a small dialog/sheet with the choices:

- Memory: No memory / Standard / Hybrid, each with its one-line explanation.
- Li-ion protection: On / Off (Off warns "Only use protected cells").
- Battery stretch: On / Off with the runtime-versus-constant-output explanation.
- Tap sensor: Keep current / Off / Set, with the sensitivity slider (Low … High, Normal marked).

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
   toggle "Electronic switch" / "Clicky switch" and the matching steps, a checklist (screen at full
   brightness, dark room, light close to the square), buttons Start and Cancel.
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
