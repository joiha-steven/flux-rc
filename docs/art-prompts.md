# Image prompts

Prompts used to generate flux-rc's artwork with an image model. Keep them here so a missing or
inconsistent image can be regenerated with the same style.

Generated files go to `assets/raw/` first; the page uses optimised copies in `assets/`.

## 1. Design direction (reference only, not shipped)

```
Design a polished web app UI for "flux-rc", an optical programmer for high-end flashlights
(NXS R1 driver). Show two screens side by side: a desktop browser at 1440 px wide and an iPhone
at 375 px wide.

Mood: premium outdoor gear meets precision instrument. Very dark charcoal background (#0e0f11),
warm amber accent (#ffb547), crisp white text, subtle 1px hairline borders, 12px rounded cards,
modern sans-serif (like Inter), numbers in a monospace font.

Layout, top to bottom, like a flashlight vendor's configurator:
1. Header: small wordmark "flux-rc" in amber monospace, buttons "Presets" and "Saved".
   Under it a row of three pill buttons: "Everyday", "Tactical", "Gentle".
2. Section "One cell" with a small photo of one 18650 battery. Below it a horizontal row of four
   large mode tiles connected by small arrows (mode 1 -> 2 -> 3 -> 4, then loops back). Each tile
   is a photo of a dark forest trail lit by a flashlight beam; the beam gets brighter from tile 1
   to tile 4. Each tile shows small text at the top ("0.4% · 120 mW") and a big level number at
   the bottom left ("13"), with up/down chevrons on the right edge.
3. Section "Two cells in series" with the same row of four tiles; the last tile says
   "Afterburning 100% · 30 W" with a warm orange glow.
4. Section "Behaviour": four equal option cards with icons: "Hybrid memory", "Li-ion protection
   on", "Battery stretch on", "Tap sensor: keep current".
5. Footer bar: a collapsed "Advanced (vendor safety settings)" row with a lock icon on the left,
   and on the right "20.6 s per loop" plus a large amber "Program" button.

On the phone: the four mode tiles become a 2x2 grid numbered 1-4, and the Program button is a
sticky bar at the bottom of the screen.

Clean, realistic product UI, high detail, no lorem ipsum, all text in English.
```

## 2. Mode tile photos (shipped)

Generate one image per prompt, all 1200 x 800, landscape, same scene and camera.

Shared scene (paste before each brightness line):

```
Photorealistic night photo, first-person view down a narrow forest trail at night, tall pine
trunks on both sides, light fog, a handheld flashlight beam pointing straight down the trail.
Fixed camera, identical framing in every image of this series, no people, no text, no logo,
no lens flare graphics. The edges of the frame stay almost black.
```

Then one of:

```
moonlight: a very faint deep red light, barely lighting the ground a meter ahead.
low: a dim, neutral white spot lighting only the first few meters of the trail.
medium: a moderate white beam lighting the trail about 20 meters ahead.
high: a bright white beam lighting the trail and tree trunks 50 meters ahead.
max: an intensely bright white beam flooding the whole trail and the trees, hot center.
afterburning: an extremely intense beam with a warm orange-white hot center, everything lit,
  slight glow in the fog.
strobe: the same bright beam shown as a sharp frozen flash with a dark vignette, as if caught
  mid-strobe.
beacon: no beam, only a red glow pulsing from the flashlight in the foreground lighting the fog.
```

## 3. Battery images (shipped)

Transparent background PNG, 800 x 400, consistent studio lighting, slight top-down angle:

```
Product render on a transparent background, soft studio light, realistic:
a) one 18650 lithium-ion cell, black wrap, small "3.7V" label
b) two 18650 lithium-ion cells end to end in series, black wrap
c) two CR123A lithium cells end to end in series, silver wrap
No brand names, no other text.
```
