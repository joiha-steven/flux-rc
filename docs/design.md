# UI design

flux-rc is one static page. No accounts, no server, no build step. Everything is stored in the
browser.

**Visual reference: [`design-reference.jpg`](design-reference.jpg).** Match its look: layout,
spacing, type, tile photos, colours. Its numbers are placeholders and partly wrong: real levels are
1–32 and every %/W number must come from `LEVELS` / `AFTERBURNING` in `src/core/` (the page builds the
labels with `modeLabel` in `src/ui/mode-text.js`, which matches core's `describeMode` in English).

The structure deliberately follows the original lux-rc programmer (battery group, row of four mode
tiles with up/down arrows, row of option tiles, locked advanced section, Program button), so people
who know that page feel at home.

## Principles

- **Light and dark.** The page follows the browser's colour-scheme setting at first; a topbar
  button flips to the other theme and remembers it (see Theme). Tile photos are dark in both themes, so text drawn on them stays light.
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
| `--bg` | `#e6e3dc` | `#20211f` | shell (page) |
| `--surface` | `#efede7` | `#272825` | panels: footer bar, Advanced panel, dialogs, tile cards |
| `--surface-2` | `#e8e5de` | `#2d2e2b` | list items, hover on flat controls, the selected preset face |
| `--line` | `#cdc9bf` | `#3a3b37` | 1 px borders on panels (decorative, not text) |
| `--text` | `#1d1c19` | `#e8e6de` | main text |
| `--muted` | `#5c5850` | `#a4a197` | secondary text, device labels |
| `--key`, `--key-hover`, `--key-edge` | `#f9f8f4`, `#ffffff`, `#c4bfb4` | `#30312e`, `#373834`, `#454641` | raised key: face, hover face, 1 px rim |
| `--key-hi`, `--key-drop` | white 0.9 / warm shadow | white 0.07 / black | key's top highlight and short drop shadow; pressed = drop gone |
| `--well`, `--well-edge`, `--well-shade` | `#d9d5cc`, `#bdb8ad` | `#151613`, `#0c0d0b` | recessed window: switch track, segmented track, number readouts, text inputs, photo window |
| `--accent` | `#eba43b` | `#eba43b` | amber FILL only: Program key, the lit zone of the Use switch, small state marks (selected preset bar, On dot) |
| `--accent-edge` | `#b07a28` | `#a8701f` | lower rim of the amber key and rim of the On dot |
| `--on-accent` | `#1a1205` | `#1a1205` | text on amber |
| `--accent-strong` | `#844b00` | `#eba43b` | amber as text, border or focus ring: wordmark, focus, checked option card, segmented bar |
| `--danger` | `#c0272d` | `#ff6b6b` | errors |
| `--ok` | `#17703d` | `#5bd68a` | success |
| `--scrim`, `--shadow`, `--accent-glow` | translucent ink | translucent black / amber | dialog backdrop, dialog/toast/menu shadow, afterburning rim |
| `--photo-text`, `--photo-muted`, `--plate` | light ink | same | text and plates drawn on beam photos |

Material: three depths, told apart by lightness first and a short top-lit shadow second: shell
`--bg` < panel `--surface` < raised key `--key`; recessed windows use `--well`. A raised key has
`--key` face, `--key-edge` rim, `inset 0 1px 0 --key-hi` and `--key-drop`; hover only lightens the
face; pressed sinks 1 px and loses the drop shadow (`--press`, 0.1 s). The Program key is the one
amber key. No glow, no hover lift, no gradients.

Shared controls (`styles/controls.css`): the Use switch is a recessed 44 x 24 track with a raised
round thumb; when on, the thumb sits right and an amber bar lights the exposed left part (position
tells on from off, not just colour). A segmented control is a recessed track whose checked option
is a raised key face in bold with a 2 px `--accent-strong` bar. Option cards in dialogs are raised
keys; the checked one gets a 2 px `--accent-strong` border and a check mark. Text inputs are
recessed windows, selects are raised keys, list items sit on `--surface-2`, toasts and menus are
raised surfaces with a soft shadow, dialogs are panels with a soft shadow.

Contrast (WCAG AA, 4.5:1 for text; measured in the browser from the resolved tokens):
`--muted` on `--key` 6.7 light / 5.1 dark, on `--surface` 6.1 / 5.7, on `--bg` 5.5 / 6.3, on
`--well` 4.8 / 7.0, on `--surface-2` 5.6 / 5.3, on `--key-hover` 7.1 / 4.6. `--text` on `--key`
16.0 / 10.5, on `--well` 11.6 / 14.5. `--on-accent` on `--accent` 8.8. `--accent-strong` on
`--surface` 6.0 / 7.0, on `--key` 6.6 / 6.2. Use `--accent` only as a fill with `--on-accent` ink;
use `--accent-strong` wherever amber is text or an outline.

Colours that stay literal on purpose: the flashing square (protocol), the Program screen, and
gradients and text shadows over the beam photos.

### Theme

One icon button in the topbar (`#btn-theme`) toggles Dark and Light. The icon shows what a click
does, like the label: a sun in dark ("Switch to light theme"), a moon in light ("Switch to dark
theme"). The first visit follows the browser's colour-scheme setting (and keeps following it if it
changes). A click flips to the other theme and stores it in `localStorage` under `flux-rc:theme`
("light" or "dark"); from then on the stored choice wins. Anything else stored, including an old
"auto", counts as no choice. The theme is set as `<html data-theme>`. A small inline script in
`<head>` applies light (stored, or from the browser) before the stylesheets paint, so there is no flash. A single
`theme-color` meta is dark and `theme.js` switches it to the light background. If storage fails the
toggle still works for the current page view.
Logic: `src/ui/theme.js`.

### Language

A key left of the theme button (`#btn-lang`) shows the current language's short label (EN, VI, DE,
日本語, 中文) and opens a dropdown menu (`role="menu"`, items `menuitemradio`, each in its own name and
with its own `lang`). Choosing one saves `flux-rc:lang` and reloads the page; the autosaved config
survives the reload. Keyboard: Enter, Space or ArrowDown opens; arrows, Home, End move; Escape closes
and returns focus; Tab and outside clicks close. Below 400 px the Presets and Saved keys shrink to 44 px
icons so the wordmark and this key fit. Logic: `src/ui/language-menu.js`, `src/ui/i18n.js`. Ja and zh-Hans
use system CJK fonts after Plum Sans (`styles/tokens.css`).

Radius by function: 12 px on panels and cards (`--radius`), 8 px on keys and windows (`--radius-s`),
6 px on keys inside a cluster (`--radius-xs`), 4 px on printed plates (`--radius-plate`). 8 px spacing grid. Content max width 1080 px,
centred, 24 px gutters (16 px on phones).

## Typography

Fonts are self-hosted from `assets/fonts/` via `styles/fonts.css` (load it first):

- **Plum Sans** (Inter-based) for all text. `font-family: "Plum Sans", system-ui, sans-serif`.
- **Plum Mono** (JetBrains Mono-based) only where a number or code is the point: the wordmark,
  level numbers and short codes on tiles, loop time, Packet details, PIN
  digits. The tile label (power, percent) and the picker's power and percent are Plum Sans, not mono. Not for subtitles or descriptions. Note its 400 weight already renders fairly heavy.

Scale (px, line height): caption 12/16, small 13/18, body 15/22, title 18/24 (section headings),
display 24/28 (dialog titles), tile number 40/1 desktop and 32/1 phone.
Weights: 400 body, 500 labels and buttons, 600 headings. Nothing bolder.
Letter spacing: -0.01em on 18 px and up; +0.02em on the wordmark; 0 elsewhere. No all-caps text
except device labels: "LVL" on tiles and the Behaviour card labels (MEMORY, LI-ION PROTECTION, ...).
They are 11-12 px, weight 500, +0.08em, `--muted`, and the all-caps is CSS `text-transform` (the
locale strings stay in normal case). Values next to them are body size, weight 500, `--text`.
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
in muted monospace. Right: raised-key buttons "Presets" and "Saved" with icons (labels may hide below
400 px; keep accessible names).

### Quick start

Three raised keys in a row (`.pill`): Everyday, Tactical, Gentle (`QUICK_PRESETS`), equal height
and gaps. The one equal to the current config (`aria-pressed="true"`, computed from the config, so
changing any tile or setting clears it) has a pressed face (`--surface-2` with the inset well
shade, no drop shadow) and an 8 x 3 px amber bar before its label. The other keys show the same
bar slot in `--key-edge` so labels do not shift. Text stays `--text`. One tap loads a preset with an
Undo toast. Under the row, one muted line: the description of the selected quick preset (or nothing).

### Mode groups ("One cell", "Two cells in series")

Header row: battery image (about 80 × 24 px), title, monospace subtitle ("1 × 3.7 V Li-ion",
"2 × 3.7 V Li-ion in series" or "2 × CR123A (series)"; for Li-ion a second line lists common sizes,
"18650, 18350, 21700…", because the driver cares about the cell voltage, not the size). Right side: a switch "Use" and, for two
cells, a segmented control "2 × Li-ion" / "2 × CR123A".

When a group is off, replace its tiles with one quiet recessed note (`--well`, no dashed border): "Not used. This set copies the
one-cell modes." (or two-cell, or "Modes stay as they are on the light" when both are off).

**Mode tile** (a card: aspect 1 : 1.12 on phone, 1 : 1.05 at 768-1023 px, 1.2 : 1 from 1024 px):

- Card: `--surface`, 1 px `--line`, radius 12, padding 6 px. Hover only changes the border to `--key-edge`; nothing lifts or scales.
- Photo window (radius 8, 1 px `--well-edge` rim, `--well-shade` drawn over the photo, same `object-position: center 65%` on every level). In the light theme the window is still dark inside a light card; there is no dark frame around it.
- Top left, on a solid `--plate` (radius 4, padding 4 x 6): line 1 is the power ("8.3 mW", "17 W"), 15/20, weight 600,
  -0.01em, `--photo-text`; line 2 is the percent written tight ("0.03%"), 12/16, weight 500,
  `--photo-muted`, tabular figures. Special modes show their name as line 1 and no line 2
  ("Red moonlight", "10 Hz strobe", "S.O.S.", "Red beacon", "Signal · white"); afterburning
  shows "Afterburning" over "100% · 30 W". Text comes from `tileText()` in `src/ui/modes-list.js`.
  The plate is 86% opaque dark, so both lines stay above 5.6:1 even over a white pixel (afterburning is the brightest photo).
- Top right: slot number badge 1-4 as a printed plate (30 x 30 px, `--plate`, Plum Mono 15 px weight 600, radius 4, no outline). The label's right edge leaves 4 px to the badge; the issue dot sits under it.
- Bottom strip (solid `--surface-2`, 52 px, inside the card): small "LVL" device label (11 px, weight 500, +0.08em, `--muted`) and the level number in Plum Mono, tabular, `--text` (not amber), 40 px from 1024 px up. Special modes show a
  short code instead: AB, RM, SOS, STB, BCN, SIG. Below 1024 px the strip is narrow, so LVL stacks above the number and the number shrinks to 22 px (phone) / 20 px (tablet): three-letter codes in Plum Mono are 2.25 x the font size wide and must clear the key cluster.
- Right end of the strip: up and down keys as one cluster (side by side, 88 x 44 px, divider between, outer corners radius 8, inner 0). Each button is a stable 44 x 44 hit area; only its face sinks 1 px when pressed. Up =
  next entry in the list below, down = previous. List order: (Not used, slots 2-4 only), Red
  moonlight, levels 1-32, Afterburning, S.O.S., 10 Hz strobe, Red beacon, Custom signal.
  At the first or last entry the key is disabled (no shadow, muted).
- Afterburning tile: 2 px `--accent-strong` rim on the photo window, no glow.
- Not used: the window is an empty recessed well (`--well`) with a muted "Not used" and a "+"; the slot number is printed straight onto it; the strip and keys stay.
- Inline issues (from `validateConfig` by path) as a small red or amber badge on the tile; the full
  text appears in the issues strip above the footer.
- Tapping the tile body opens the **mode picker**: dialog on desktop/tablet, bottom sheet on phone.
  It is a **grid, not a list**, so the whole choice fits on one screen without scrolling (phone may
  scroll a little):
  - **Brightness levels** first: 32 square-ish cells, 8 columns on desktop/tablet (dialog about
    760 px wide), 4 columns on phone. Each cell is a tiny beam photo (the `-thumb` file of its band,
    with the same `brightness()` rule as the tiles); the level number in Plum Mono sits top-left and the
    power ("3 W", "180 mW", Plum Sans 13 px weight 600) over the tight percent ("10%", 11 px muted) bottom-left,
    each on a solid `--plate` (radius 4), 8 px from the cell edges in every cell. Both plates fit in the 79 px phone cell.
  - **Other modes** below, under a small heading: Afterburning, Red moonlight, S.O.S., 10 Hz strobe,
    Red beacon, Custom signal, and Not used (slots 2–4 only). Wider cells (4 per row desktop, 2 per
    row phone) with their photo, name (Plum Sans 13 px, weight 600), and one short detail line ("100 % · 30 W", "Distress
    pattern").
  - Unselected cells have no visible border (2 px transparent, so nothing shifts). The current choice has a 2 px
    `--accent-strong` border plus a check on an amber plate at the top right (not colour only); hover/focus show a
    `--key-edge` border. The picker fades in over 160 ms with a 4 px rise (none under reduced motion).
  - A detail bar pinned at the bottom of the picker shows the hovered/focused/current entry in full:
    "Level 21 · 10 % · 3 W". On touch it shows the current entry.
  - Arrow keys move focus within the grid (roving focus), Enter/Space chooses, Escape closes.
  - Choosing "Custom signal" reveals its controls (colour, single/double, on time, off time) under
    the grid, inside the picker; choosing anything else closes the picker.
  - Every cell has an accessible name with the full text ("Level 21, 10 %, 3 W").

Desktop and tablet: small arrows between tiles and a thin return line under the row from tile 4
back to tile 1 (as in the reference). Phone: no arrows; the badges show the order.

### Behaviour

Four equal raised-key cards in a row at 1024 px and up (2 x 2 below): a small all-caps LABEL on
top (MEMORY, LI-ION PROTECTION, BATTERY STRETCH, BOUNCE SENSOR), the current VALUE below (Hybrid /
Standard / No memory, On / Off, Keep current / Not in use / Sensitivity 85), a muted chevron at the
right. No icons. On / Off values get a 6 px mark before the text: On is an amber dot, Off a hollow
`--muted` ring, so the state is never colour only. Values come from the real config. Tapping opens
a small dialog/sheet with the choices:

- Memory: No memory / Standard / Hybrid, each with its one-line explanation.
- Li-ion protection: On / Off (Off warns "Only use protected cells").
- Battery stretch: On / Off with the runtime-versus-constant-output explanation.
- Bounce sensor: Keep current / Not in use / Set, with the sensitivity slider (Low … High, Normal marked).

### Footer

One bar (panel: `--surface`, 1 px `--line`): left, the Advanced toggle, a flat text control with a
hover face ("Advanced (vendor safety settings)", lock icon and chevron); right, the loop time in
a small recessed number window (`--well`, mono tabular number) followed by muted "per loop", a
"More" raised-key icon button (menu: Save, Share link, Download GIF, Packet details; the menu is a
raised surface with a soft shadow) and the amber Program key with a play icon.

Expanding Advanced opens a panel above the footer bar: the warning banner, then the settings
(switch timeout, thermal cutoff with °C and °F, one-cell limit, two-cell limit, PIN digits), each
"Keep current" / "Set" (plus "No limit" where it exists).

Issues strip: when there are warnings or errors, a compact list directly above the footer. An
error disables Program and the button's accessible description says why.

On phone and tablet (below 1200 px) the loop time, More and Program sit in a sticky bottom bar (a panel with a top `--line`) instead; the
Advanced row stays in the page flow.

## Program screen

Full-screen overlay (`#program`), always dark, a step-by-step flow. Each step finishes before the
next one appears. A small step indicator sits on top: 1 Switch · 2 Get ready · 3 Enter PIN ·
4 Program (on phones only the current step shows its label). Every step has Back except step 1,
which has Cancel; Escape closes from anywhere and stops a running PIN. Steps 1–3 are a card on
a faint dot grid (CSS only, no image); step 4 is pure black. An `aria-live` region announces step
changes and the final cue, not every pulse.
Code: `src/ui/program-screen.js` (shell: open/close, wake lock, GIF URL),
`src/ui/program-steps.js` (steps 1–3 and the tailcap view), `src/ui/program-run.js` (the PIN run
and step 4), `src/ui/pin-rhythm.js` (the schedule, pure), `src/ui/beeper.js` (Web Audio).

1. **Switch**: "Which switch does your light have?" Two option cards, each with a line drawing,
   the name and one line: **Mechanical (McClicky)** (rubber cap, a click is a quick half-press) and
   **E-switch (MOFF)** (flat metal button that cuts the power while pressed, so it works inverted:
   held down at rest, a click is a quick release). The choice is stored in `localStorage` under
   `flux-rc:switch` and preselected next time; the step is still shown.
2. **Get ready**: tips as plain text with an icon (not controls): screen brightness to maximum,
   dark room, hold the light right against the screen, and "Light off: nothing pressed"
   (McClicky) or "Hold the button down so the light is off" (MOFF). The "I'm ready" tap is the user
   gesture that requests the screen wake lock and unlocks audio (iOS needs this). No fullscreen:
   switching to fullscreen on that tap surprised people.
3. **Enter PIN**: the PIN large as digit groups (2 · 2 · 2), PIN choice 222 / 112 / Custom (custom
   is validated by `isValidPin` in `src/core/config.js`: d1 1–4, d2 and d3 1–8, not 4-8-8), speed
   Normal / Slow, a Sound switch (on by default, `flux-rc:sound`), a tip for reverse clickies and the
   hint that a PIN just changed in Advanced only applies after this programming. **Start** runs the
   PIN metronome: a 3-2-1 count-in with a low beep each second, then one pulse per click: a big circle
   lights up, the action word shows (PRESS for McClicky, RELEASE for MOFF), a short high beep plays
   and Android vibrates. Progress shows digit and click. Between digits the circle dims and the word is "WAIT"; after
   the last digit "WAIT" again with "PIN entered. Next: …". At the final cue (long beep) step 3
   **holds**: the circle becomes a solid ring whose fill drains as a countdown, the big word reads
   "ON · KEEP IT ON" (McClicky) or "RELEASE · LEAVE IT" (MOFF), and below it "Flashing starts in
   2 s". Exactly at the planned GIF start the screen moves to step 4. **Stop** aborts (also during
   the hold). A **rhythm timeline** (`src/ui/rhythm-timeline.js`, pieces from `timelineSegments` in
   `pin-rhythm.js`) shows the whole run as a strip, like the timing diagram in the Lux-RC manual:
   count-in dots, clicks as raised blocks as wide as their on-time, gaps as empty space, and one long
   block "ON · keep it on" / "Release · leave it" up to the GIF start. It is a preview on the setup
   screen (redrawn when the PIN or speed changes) and gets a playhead on the run's clock during the
   run: passed pieces dim, the current one is highlighted, and during the final wait the long block
   is outlined as next. With reduced motion the playhead jumps from piece to piece and the hold ring
   empties once a second. The drawing is `aria-hidden`; a screen-reader sentence describes it. Users follow the beeps, not the light:
   it may not flash during the clicks. With reduced motion the circle changes colour only (no scale
   or glow). Under the buttons a small link "PIN not working? Try the tailcap method" opens the
   **tailcap view** (for an electronic button on the driver, battery always connected): unscrew the
   tailcap a little and wait, press and hold the button, screw the tailcap back on while holding, a
   dim red light means programming mode; one big button "Dim red light is on" starts step 4 at once.
4. **Program**: the GIF centred at 300 × 300 CSS px (shrinks on small viewports), the final cue
   above it in dim text, and below it (never covering it) "Dim red light? Keep holding the light on
   the square." with "I see the red light" and "No red light, try again" (back to step 3, or to the
   tailcap view on that path). After "I see the red light": "Keep holding until the red light goes
   off (10–20 s)" with "It went off: done" (success view: "Programmed. Switch the light off and on to
   try your modes." and Close) and "Still red" (troubleshooting: brightness, closer, darker, a
   second attempt is sometimes needed; Try again goes back to step 3).

### PIN timing

The light waits only about 5–6 s in programming mode, and the signal loops every ~19 s starting
with 3 s of green lead, so the GIF must start at frame 0 right after the light enters programming
mode. A fresh blob URL restarts the GIF at frame 0; it is assigned `GIF_START_DELAY_MS` (2.3 s) after
the final cue: a 2 s breather, counted down by the hold on step 3 ("Flashing starts in 2 s"), plus
300 ms to react and for the driver to boot. Step 4 mounts at that moment on the run's clock and
assigns the blob URL immediately. Keep it under about 3 s so the lead starts well inside
the light's wait. Beeps are scheduled on the AudioContext clock and the visuals and the GIF start read
the same clock (or `performance.now()` when sound is off or unavailable). On the audio clock the
visuals and the GIF start are shifted by `AudioContext.outputLatency` (when 0–500 ms), so they match
what is heard over Bluetooth. Start waits up to 500 ms for audio to resume; if sound is on but audio
does not run, step 3 says "Sound isn't available. Follow the circle instead." and the run continues.
A run never continues with a broken rhythm: if the audio clock stops or the page is hidden it
returns to the PIN setup with "Interrupted. Start again when you're ready.", and if any event is
shown more than 150 ms late (`isTooLate` in `pin-rhythm.js`) with "Timing slipped. Start again."
Once the hold has begun, a stopped audio clock no longer aborts: the light may already be in
programming mode, so a plain timer moves on to step 4 at most 200 ms after the planned GIF start
(still well inside the light's 5–6 s wait). A hidden page, Stop and Escape still abort during the
hold, and then no GIF starts.
Timing (manual limits in brackets):

| | Normal | Slow | Limit |
|--|--|--|--|
| Click on-time | 200 ms | 300 ms | 64–499 ms |
| Off between clicks of a digit | 250 ms | 300 ms | ≤ 300 ms (≥ 500 ms is a digit gap) |
| Off between digits | 1000 ms | 1150 ms | 500–1250 ms (longer wipes the digits) |
| Wait after the last digit | 1000 ms | 1000 ms | about 1 s |

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

The exact text of every string lives in `locales/en.js`, the source of truth; code asks for it by
key with `t()` (`src/ui/i18n.js`), and `locales/README.md` explains translating. The table below is
the guidance behind those strings, not a copy of them: when you change wording, change
`locales/en.js` and keep to these rules.

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

Program screen wording:

- Switch names: "Mechanical (McClicky)" and "E-switch (MOFF)". Action words: PRESS and RELEASE.
  Final cues: "Switch on and leave it on" and "Release and leave it".
- After the red light: "Keep holding until the red light goes off (10–20 s)". If it stays red: a
  second attempt is sometimes needed.
- Tips (plain text with icons, not controls): screen brightness at maximum; daylight or bright
  room light can overexpose the sensor, so find a dark room; hold the light right against the
  screen.

## Performance

The page must feel instant on a phone on a mobile network. No build step, so:

- `<link rel="modulepreload">` in `index.html` for every module the page imports at startup, so
  they download in parallel instead of one import level at a time.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` for both font files.
- Tile `<img>`: explicit `width`/`height` (no layout shift), `decoding="async"`, and
  `fetchpriority="high"` only for the first group's four tiles. The mode picker uses the
  `beam-*-thumb.webp` files (96 px wide), not the full tiles.
- No work on the main thread at startup beyond rendering the current config; build the GIF only
  when it is needed (Program, Download GIF, Packet details, loop time may use frame durations
  without building the GIF bytes).
