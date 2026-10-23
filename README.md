# flux-rc

A simpler optical programmer for flashlights that use the NXS R1 driver (Lux-RC 371D light
engine). Pick your modes and options, hold the flashlight against the screen, and the flashing
square programs it.

It is one static web page: no account, no server, nothing leaves your browser.

## Run it locally

```bash
npm run serve
```

Then open http://localhost:8080. Any static file server works; the page only needs to be served
over HTTP (not opened as `file://`) because it uses ES modules.

## Test

```bash
npm test
```

Uses the built-in Node test runner (Node 20 or newer). No dependencies to install.

## Project layout

| Path | What it is |
|------|------------|
| `index.html` | The page |
| `styles/` | CSS |
| `src/core/` | Protocol: config to fields, fields to frames, frames to GIF, validation. No DOM. |
| `src/data/` | Built-in presets |
| `src/ui/` | Page logic: rendering, state, storage, program screen |
| `test/` | Node tests; `test/fixtures/` holds GIFs recorded from the original programmer |
| `docs/protocol.md` | The optical protocol, reverse engineered and verified |
| `docs/config-model.md` | The config object the UI edits |
| `docs/design.md` | UI layout and behaviour |

## How it works

The driver reads the length of white pulses: 40 ms means 0, 140 ms means 1, 240 ms means "leave
this setting unchanged". A packet carries a header, 15 settings and a checksum, and loops forever.
flux-rc builds the same animated GIF as the original programmer, byte for byte. Details in
[docs/protocol.md](docs/protocol.md).

## Status

The encoder matches all ten GIFs recorded from the original. It has not yet been tried on a real
flashlight. Advanced settings (thermal cutoff, output limits, PIN, switch timeout) are derived from
vendor presets and have not been tested on a light.
