# UI design

flux-rc is one static page. No accounts, no server, no build step. Everything is stored in the
browser.

## Principles

- **Dark first.** People program in a dim room and the flashing square sits on black. A light theme
  exists for daytime editing (follows `prefers-color-scheme`), but the programming screen is always
  black.
- **One screen, top to bottom.** Batteries, then modes, then behaviour, then advanced. No wizard,
  no tabs for the main flow.
- **Say what the light will do, in plain words.** "Level 21 · 10 % · 3 W", "Starts in the last
  mode used", "Cuts output at 60 °C". Never show raw field numbers outside the details panel.
- **Dangerous settings are opt-in.** Everything the original site reserves for vendors sits in a
  collapsed "Advanced" section, defaults to "Keep current", and carries a warning.

## Layout

| Width | Layout |
|-------|--------|
| < 768 px (phone) | Single column, 16 px gutters. Sticky bottom bar with the Program button and a one-line summary. |
| 768–1199 px (tablet) | Single column, max 720 px, centred. Battery group cards side by side. Same sticky bottom bar. |
| ≥ 1200 px (desktop) | Main column (max 760 px) plus a 340 px sticky sidebar holding the summary card. No bottom bar. |

### Header

Wordmark "flux-rc", tagline "Optical programmer for NXS R1 drivers". Right side: "Presets" and
"Saved" buttons (icons with labels; labels may hide below 400 px but keep accessible names).

### 0. Quick start

A row of three cards right under the header, from `QUICK_PRESETS` in `src/data/quick-presets.js`:
Everyday, Tactical, Gentle. Each card shows its name, its one-line description and its four modes
as small level chips. One tap loads it (replaces the config, "Undo" toast). The card whose config
equals the current config is marked as selected. Phone: horizontal scroll row with snap, or a
stacked list if three fit; tablet and desktop: three equal columns. The same three also appear at
the top of the Presets dialog, above the vendor presets, under a "Quick start" heading.

### 1. Batteries

Two cards:

- **One cell**: switch "Use with one Li-ion cell". Off text: "The one-cell mode set will copy the
  two-cell set."
- **Two cells**: switch "Use with two cells in series", and a segmented control "2 × Li-ion" /
  "2 × CR123A" (only when on).

If both are off, a note: "Modes will be left as they are on the light."

### 2. Modes

One block per enabled group ("One cell", "Two cells"). Each block lists four slots.

Each slot is a row (card on phone):

- Slot number badge (1–4).
- Mode type select: Brightness level, Afterburning, Red moonlight, S.O.S., 10 Hz strobe, Red beacon,
  Custom signal, and (slots 2–4 only) Not used.
- Contextual controls:
  - Brightness level: range slider 1–32 plus a readout "Level 21 · 10 % · 3 W".
  - Custom signal: colour (Red / White), flashes (Single / Double), on time (64 ms / 250 ms), off
    time (32 ms / 250 ms / 1 s / 3 s), as small segmented controls.
  - Others: a one-line description.
- Inline warnings under the slot (from `validateConfig`).

A "Copy from one cell" / "Copy from two cells" action appears on a block when both groups are on.

### 3. Behaviour

- Memory: three option cards: No memory ("Always starts in mode 1"), Standard ("Starts in the last
  mode used"), Hybrid ("Starts in the last mode; cycling restarts from mode 1").
- Switches: "Lithium-ion protection" (with a warning when turned off: "Only use protected cells"),
  "Battery stretch" (explain: longer runtime vs constant output).
- Tap sensor: Keep current / Off / Set, with a sensitivity slider (Low … High, normal marked).

### 4. Advanced (collapsed by default)

Warning banner: "The original programmer only lets vendors change these. Wrong values can overheat
the light or damage the battery. Leave them on Keep current unless you know why."

Each setting is a row with "Keep current" / "Set" (plus "No limit" where it exists) and a slider:

- Mode switch timeout: 0.1–2.0 s.
- Thermal cutoff: 30–100 °C, also showing °F. "No limit" shows a red warning.
- One-cell output limit: highest level 2–31, mark "Factory default" at 28.
- Two-cell output limit: highest level 2–32, or No limit (afterburning allowed).
- PIN: three digit pickers (1–4, 1–8, 1–8). 4-8-8 is invalid.

### Summary (sidebar on desktop, bottom bar plus sheet on phone and tablet)

- Program button (primary, disabled while there is an error, with the reason shown).
- Duration of one loop, e.g. "20.6 s per loop".
- Warnings and errors list.
- Actions: Save, Share link, Download GIF.
- "Packet details" disclosure: the 15 field values with names, checksum, frame count.

On phone and tablet the bottom bar shows the Program button and "4 + 4 modes · 20.6 s"; tapping the
summary text opens the full summary as a bottom sheet.

## Program screen

Full-screen overlay, pure black background (`#000`), nothing bright near the square.

1. **Prepare** step: short instructions with a toggle "Electronic switch" / "Clicky switch".
   - Electronic switch: disconnect the battery, reconnect it while holding the button, keep holding;
     programming mode starts after about three seconds.
   - Clicky switch: enter the PIN (public PIN 222, or the one from your vendor) as short clicks with a
     one-second pause between digits, wait one second, switch on. A dim red light means the PIN was
     accepted.
   - Checklist: screen brightness at maximum, dark room, light as close to the square as possible.
   - Buttons: Start, Cancel.
2. **Flashing** step: the generated GIF centred, 300 × 300 CSS px (shrink to fit only if the
   viewport is smaller). Small dim grey text above: "Hold the light against the square. Programming
   takes 10–20 seconds; the red light goes off when it is done." Buttons below, dim: Restart, Done.
   - Request fullscreen and a screen wake lock when starting; release both on Done or Escape.
   - Restart reloads the GIF from frame 0 (new object URL).

## Presets and saved configs

- **Presets** dialog: the vendor presets recorded from the original (`src/data/presets.js`), each
  with a one-line description. Loading replaces the current config and shows an "Undo" toast.
- **Saved** dialog: list from `localStorage` (name, date), Load, Rename, Delete (with confirm).
  "Save current" asks for a name. Empty state: "Nothing saved yet."
- **Share link**: copies a URL with the config in the hash (`#c=` + base64url JSON). Opening such a
  link loads the config. If the clipboard fails, show the link in a read-only field.
- If `localStorage` is unavailable, Saved shows a clear message and the rest keeps working.

## Visual style

- System font stack, no web fonts, no external requests at all.
- Colour tokens on `:root` with dark and light sets. Dark: background `#0e0f11`, surface `#17191c`,
  raised `#1f2226`, text `#e8e6e3`, muted `#9a9da3`, accent warm amber `#ffb547`, danger `#ff6b6b`,
  ok `#5bd68a`. Light: matching set with the same accent darkened for contrast.
- 8 px spacing grid, 12 px radius on cards, 1 px borders instead of heavy shadows.
- Tap targets at least 44 px. Visible focus ring (accent, 2 px).
- Respect `prefers-reduced-motion`.

## States to check

Empty saved list; very long saved names; both groups off; all four slots used and only slot 1 used;
an error (unsupported signal timing, invalid PIN) disabling Program; no `localStorage`; light and
dark theme; widths 375, 768, 1440.
