# Config model

The UI edits one plain JSON object, the **config**. `src/core/` turns it into the 15 protocol fields
(see `protocol.md`). The same object is what gets saved in `localStorage` and put in share links,
so keep it JSON-serialisable and versioned.

Numeric settings are stored as **raw field values**, so encoding is a direct copy. Helpers in
`src/core/scales.js` convert them for display (°C, seconds, level numbers, sensitivity).

```js
{
  version: 1,

  // Mode set used when the light runs on one cell.
  single: {
    enabled: true,            // false = "I won't use it with one cell"
    modes: [Mode, Mode | null, Mode | null, Mode | null],   // modes[0] is never null
  },

  // Mode set used when the light runs on two cells in series.
  dual: {
    enabled: false,           // false = "I won't use it with two cells"
    cells: 'li-ion',          // 'li-ion' (2S) | 'cr123a' (2SP)
    modes: [Mode, Mode | null, Mode | null, Mode | null],
  },

  memory: 'hybrid',           // 'none' | 'standard' | 'hybrid'
  protection: true,           // lithium-ion low-voltage protection
  stretch: true,              // battery stretch

  bounce:        { action: 'keep', value: 179 },  // 'keep' | 'off' | 'set'; value 1–254
  switchTimeout: { action: 'keep', value: 16 },   // 'keep' | 'set'; value 1–63
  thermal:       { action: 'keep', value: 13 },   // 'keep' | 'none' | 'set'; value 1–60
  singleLimit:   { action: 'keep', value: 27 },   // 'keep' | 'set'; value 1–30
  dualLimit:     { action: 'keep', value: 31 },   // 'keep' | 'none' | 'set'; value 1–31
  pin:           { action: 'keep', digits: [2, 2, 2] },  // 'keep' | 'set'; d1 1–4, d2 1–8, d3 1–8
}
```

A `null` mode means "not in use".

```js
Mode =
  | { type: 'level', level: 1..32 }
  | { type: 'afterburning' }
  | { type: 'moonlight' }
  | { type: 'sos' }
  | { type: 'strobe' }
  | { type: 'beacon' }
  | { type: 'signal', color: 'red' | 'white', double: boolean,
      onMs: 64 | 250, offMs: 32 | 250 | 1000 | 3000 }
```

## Field mapping summary

| Config | Field | Encoding |
|--------|------:|----------|
| `single.modes` / `dual.modes` | 0–7 | mode codes, compaction and group mirroring as in `protocol.md` section 4 |
| `memory`, `protection`, `stretch`, `dual.cells` | 8 | sum; NULL when the sum is 0 |
| `switchTimeout` | 9 | `keep` → NULL, `set` → value |
| `thermal` | 10 | `keep` → NULL, `none` → 127, `set` → value |
| `singleLimit` | 11 | `keep` → NULL, `set` → value |
| `dualLimit` | 12 | `keep` → NULL, `none` → 32, `set` → value |
| `pin` | 13 | `keep` → NULL, `set` → (d1−1)·64 + (d2−1)·8 + (d3−1) |
| `bounce` | 14 | `keep` → NULL, `off` → 255, `set` → value |

`dual.cells` only counts when `dual.enabled` is true.

## Default config

Two groups enabled is the common case for lights that take both one 18650 and two CR123A cells, but
the default keeps it simple: single cell on with four modes, dual off, everything advanced on
`keep`.

```js
single.modes = [
  { type: 'level', level: 6 },
  { type: 'level', level: 14 },
  { type: 'level', level: 21 },
  { type: 'level', level: 28 },
]
dual.modes = [
  { type: 'level', level: 6 },
  { type: 'level', level: 14 },
  { type: 'level', level: 21 },
  { type: 'afterburning' },
]
memory = 'hybrid', protection = true, stretch = true, everything else 'keep'
```
