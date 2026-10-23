# NXS R1 optical programming protocol

This is the reference for everything flux-rc sends to a flashlight. It was reverse engineered on
2026-10-24 from the original web programmer at lux-rc.com. Every rule here is marked with how it was
established:

- **verified**: our encoder reproduces the original GIF frame for frame (see `test/fixtures/`).
- **experiment**: a setting was changed on the original site and the resulting GIF was decoded.
- **inferred**: derived from vendor presets or slider geometry on the original page, but not
  produced by changing that setting ourselves (the site locks these settings for normal accounts).

If you change anything in `src/core/`, the fixtures must still pass. Do not "fix" a rule here
without a new recording that proves it.

## 1. Physical layer (verified)

The flashlight has a light sensor. The programmer shows a square that switches between black and
white, and the light measures how long each white pulse lasts.

All durations are in centiseconds (1 cs = 10 ms), because that is the native unit of GIF frame
delays.

| Symbol  | Colour | Duration | Meaning                                  |
|---------|--------|---------:|------------------------------------------|
| `LEAD`  | green `#329600` | 300 | Lead-in so the user can place the light |
| `RESET` | white  | 34       | Start of a packet                        |
| `ZERO`  | white  | 4        | Bit 0                                    |
| `ONE`   | white  | 14       | Bit 1                                    |
| `NULL`  | white  | 24       | "Leave this field unchanged"             |
| `OFF`   | black  | 10       | Separator after every white pulse        |
| `GAP`   | black  | 30       | Section separator                        |

## 2. Packet (verified)

```
LEAD
RESET GAP                                  (no OFF after RESET)
header: 8 bits of 151, each pulse followed by OFF
GAP                                        (so the header ends with OFF then GAP)
15 fields: each is either NULL+OFF, or its bits (MSB first), each pulse followed by OFF
checksum: 8 bits, each pulse followed by OFF
```

- Header byte is always `151` (`0x97`). It identifies the NXS R1 target.
- Field bit widths, in order: `6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 7, 6, 6, 8, 8`.
- Checksum = (sum of all non-NULL field values) mod **255**, sent as 8 bits.
- The animation loops forever.

## 3. GIF container (verified, byte for byte)

The original serves a 1x1 pixel GIF89a scaled up to 300x300 CSS pixels.

```
"GIF89a"
logical screen: width 1, height 1, packed 0x80, background 0, aspect 0
global colour table (2 entries): 00 00 00, FF FF FF
application extension: 21 FF 0B "NETSCAPE2.0" 03 01 00 00 00     (loop forever)
per frame:
  graphic control extension: 21 F9 04 04 <delay lo> <delay hi> 00 00
  image descriptor:          2C 00 00 00 00 01 00 01 00 <packed>
    packed = 0x80 only for the LEAD frame, which carries a local colour table: 32 96 00, 00 00 00
    packed = 0x00 for all other frames (global table)
  image data: 02 02 <44 01 | 4C 01> 00
    44 01 = colour index 0 (black, or green in the LEAD frame); 4C 01 = colour index 1 (white)
trailer: 3B
```

## 4. The 15 fields

Index is 0-based.

| # | Width | Meaning | Value | Status |
|--:|------:|---------|-------|--------|
| 0–3 | 6 | Single-cell group, modes 1–4 | Mode code (section 5) | verified |
| 4–7 | 6 | Dual-cell group, modes 1–4 | Mode code | verified |
| 8 | 5 | Options | memory + protection + stretch + cell type (section 6) | verified |
| 9 | 6 | Mode switch timeout | 1–63, about 32 ms per step (63 = 2.0 s, 3 = 0.1 s) | inferred |
| 10 | 7 | Thermal cutoff | 1–60 (section 7); 127 = no limit | inferred |
| 11 | 6 | Single-cell output limit | highest allowed level number minus 1 (1–30) | inferred |
| 12 | 6 | Dual-cell output limit | highest allowed level number minus 1 (1–31); 32 = no limit, afterburning allowed | inferred |
| 13 | 8 | PIN | (d1−1)·64 + (d2−1)·8 + (d3−1); d1 in 1–4, d2 and d3 in 1–8 | inferred |
| 14 | 8 | Bounce (tap) sensor | 1–254 = sensitivity, higher is more sensitive; 255 = sensor off | experiment |

NULL in any field means "keep what the light already has".

### Mode groups (experiment)

- A group's modes are listed in order. Modes marked "not in use" are removed and the remaining modes
  shift up; empty slots at the end are NULL. Mode 1 of a group can never be "not in use".
- If only one group is enabled, the other group's four fields repeat the enabled group's fields.
- If neither group is enabled, all eight mode fields are NULL.

## 5. Mode codes (verified)

| Code | Mode |
|-----:|------|
| 31 + (n − 1) for n = 1…32 | Brightness level n (table below) |
| 63 | Afterburning (100 %, 30 W) |
| 1 | Red moonlight |
| 2 | S.O.S. (US Coast Guard pattern, 46 CFR 161.013-7) |
| 4 | 10 Hz strobe |
| 29 | Red beacon |
| other 0–30 | Custom signal |

Custom signal code = (colour + double + onTime + offTime − 1) mod 64, where

- colour: red = 0, white = 1
- double (each flash is sent twice): no = 0, yes = 2
- onTime: 64 ms = 4, 250 ms = 0
- offTime: 32 ms = 0, 250 ms = 8, 1 s = 16, 3 s = 24

The specials are signals too: red beacon = red, double, 64 ms on, 3 s off = 29, and 10 Hz strobe =
white, single, 64 ms on, 32 ms off = 4. The combination **250 ms on + 32 ms off is not supported**:
the original refuses it, because those codes are taken by afterburning, moonlight and S.O.S.

Brightness levels (n, share of maximum, LED power):

| n | % | Power | n | % | Power | n | % | Power | n | % | Power |
|--:|--:|------:|--:|--:|------:|--:|--:|------:|--:|--:|------:|
| 1 | 0.005 | 1.5 mW | 9 | 0.08 | 25 mW | 17 | 2 | 0.6 W | 25 | 29 | 8.8 W |
| 2 | 0.007 | 2 mW | 10 | 0.1 | 36 mW | 18 | 3 | 1 W | 26 | 38 | 11 W |
| 3 | 0.01 | 3 mW | 11 | 0.18 | 53 mW | 19 | 4.6 | 1.4 W | 27 | 47 | 14 W |
| 4 | 0.014 | 4 mW | 12 | 0.26 | 80 mW | 20 | 7 | 2 W | 28 | 55 | 17 W |
| 5 | 0.02 | 5.8 mW | 13 | 0.4 | 120 mW | 21 | 10 | 3 W | 29 | 63 | 19 W |
| 6 | 0.03 | 8.3 mW | 14 | 0.6 | 180 mW | 22 | 14 | 4 W | 30 | 70 | 21 W |
| 7 | 0.04 | 12 mW | 15 | 0.9 | 270 mW | 23 | 18 | 5.4 W | 31 | 74 | 23 W |
| 8 | 0.06 | 17 mW | 16 | 1.4 | 400 mW | 24 | 22 | 6.5 W | 32 | 80 | 24 W |

## 6. Options field (experiment)

Sum of:

- memory: none = 0 (always start in mode 1), standard = 8 (start in the last mode), hybrid = 24
  (start in the last mode, but cycling restarts from mode 1)
- lithium-ion protection: on = 1, off = 0
- battery stretch: on = 4, off = 0
- dual-cell type: 2 if the dual group is enabled with CR123A primary cells, else 0

If the sum is 0 the field is NULL (seen in vendor presets; the original cannot tell "all off" from
"no change").

## 7. Derived scales (inferred)

### Thermal cutoff

Known points (field value → °C): 2 → 30, 5 → 40, 9 → 50, 13 → 60, 19 → 70, 28 → 80, 39 → 90,
54 → 100. The 50/60/70 °C points are confirmed by vendor presets; the others come from the label
positions on the original slider. Interpolate linearly between points for display. Values 55–60 are
above 100 °C. 127 = no limit (the original warns that the driver can then reach 120 °C).

### Output limits

Displayed as the highest brightness level allowed. Single cell: levels 2–31, factory default 28
(17 W, because the driver caps the battery current at about 5 A). Dual cell: levels 2–32 or
afterburning.

### Bounce sensor

Displayed sensitivity = 49.2 + field / 5, from about 50 (low) to 100 (high), normal around 85
(field ≈ 179).

### Mode switch timeout

Displayed seconds = field × 0.032, rounded to 0.1 s.

## 8. Warnings the original shows (inferred)

Show these, but they do not block programming unless marked.

- **Blocks**: custom signal with 250 ms on and 32 ms off: "This timing is not supported".
- **Blocks**: PIN 4-8-8 (field 255): "Invalid PIN".
- Dual group with CR123A and a level above 25 (code > 55): output is limited to 8.8 W (29 %).
- Dual group with CR123A and S.O.S. or strobe with battery stretch off: stretch must be on.
- Dual group with CR123A, a white custom signal with off time 32 ms or 250 ms, and stretch off: turn
  stretch on.

## 9. Original "source" string (verified)

The original site stores a configuration as 51 comma-separated values. flux-rc only parses this
format to import vendor presets and to run the fixture tests. 0-based index:

| Index | Content |
|------:|---------|
| 0 | Single-cell group: `0` = not used, `1S` = one Li-ion cell |
| 1–16 | Single-cell modes 1–4, four values each: `level, colour/double, onTime, offTime` |
| 17 | Dual-cell group: `0` = not used, `2S` = two Li-ion, `2SP` = two CR123A |
| 18–33 | Dual-cell modes 1–4, same layout |
| 34 | memory (0 / 8 / 24) |
| 35 | protection (1 / 0) |
| 36 | stretch (4 / 0) |
| 37, 38 | bounce sensor: `0` = no change, `255` = off, `S` = set, then slider value v (1–254); field = 255 − v |
| 39, 40 | switch timeout: `0` = no change, `S` = set, v (1–63); field = 64 − v |
| 41, 42 | thermal: `0` = no change, `127` = no limit, `S` = set, v (1–60); field = 61 − v |
| 43, 44 | single-cell limit: `0` = no change, `S` = set, v (1–30); field = 31 − v |
| 45, 46 | dual-cell limit: `0` = no change, `32` = no limit, `S` = set, v (1–32); field = 33 − v |
| 47 | PIN: `0` = no change, `S` = set |
| 48–50 | PIN digits minus 1 (d1 0–3, d2 0–7, d3 0–7) |

A mode's `level` is `0` (not in use, never for mode 1), a mode code from section 5, or `S` (custom
signal, which then uses the next three values: colour/double 0–3 where 1 = white and 2 = double,
onTime 4 or 0, offTime 0/8/16/24). For non-`S` levels the next three values are ignored.
