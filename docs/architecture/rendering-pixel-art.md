<!-- @layer docs @kind doc -->
# Pixel Art & Rendering

This doc exists so screenshots of the running game can be interpreted **correctly**.
Low-resolution pixel art is read *differently* from photographs: in a photo,
recognition comes from abundant detail; in pixel art, **every pixel is a
deliberate decision** and meaning comes from *limitation, not abundance*. When a
screenshot is scaled up, one source pixel becomes a large square block. What you
are looking at is coarse by design, and small offsets matter a lot.

> Companion to this doc: the `interpret-game-screenshot` skill (the step-by-step
> protocol) and the standing "flag missing sprites" rule in the root `CLAUDE.md`.

---

## 1. How the game renders (the ground truth)

Source: `core/wasm-build/emscripten_main.c`, `shared/game/navigation/`.

| Property | Value |
|----------|-------|
| Native frame | **256×224 px** (`g_snes_width = aspect*2 + 256`, `g_snes_height = 224`; 240 if `extend_y`) |
| Base tile | **8×8 px**, **4 bits-per-pixel → 16 colors per palette** (SNES standard) |
| Map tile ("Map16") | **16×16 px** = a 2×2 block of 8×8 tiles (overworld & dungeon collision granularity) |
| Screen / room | **512×512 px** = **64×64** base tiles (`Math.floor(linkX / 512)` selects the screen) |
| Link's hitbox | ~**16 px wide ≈ 2 tiles** (`grid-utils.ts`: "2-tile perpendicular clearance for Link's 16px width") |
| Color | SNES CGRAM, 15-bit BGR (5 bits/channel) → expanded to RGBA at extraction |

**Coordinate model for position bugs:** world space is continuous pixels; a
*screen/room* is a 512px cell; *collision* is reasoned in 16px Map16 tiles;
*fine* placement is 8px tiles. So "Link is at the bottom-left but offset" is best
expressed as *which tile cell* he occupies vs. where he should be, not as a vague
visual position.

---

## 2. Native resolution vs. what you see (the blur trap)

The 256×224 frame is **upscaled** to the window. Pixel-art rule (from the
references): **only integer scaling (2×, 3×, 4×) with nearest-neighbor keeps
pixels crisp.** If the window is a non-integer multiple, the upscaler blurs, and
and a blurred edge can look like a real sub-pixel feature that isn't there.

**Implication when reading a screenshot:**

- Decide first whether pixels look **crisp (integer-scaled)** or **blurry
  (fractional / bilinear)**. If blurry, do **not** infer fine detail from edges.
  Reason in whole tiles, and ask for an integer-scaled or 1× capture if detail matters.
- A single source pixel may span many screen pixels. Count in *source* pixels/tiles,
  not screen pixels.

---

## 3. Reading pixel art correctly (principles from the references)

From the three reference guides (sprite-ai.art, civitai, ai-media-studio):

1. **Every pixel is intentional.** Unlike a downsampled photo, there's no noise. If
   a pixel is a different color, it *means* something (an edge, a highlight, a
   distinct object). Don't dismiss single-pixel differences.
2. **Value contrast over hue.** Readability comes from light/dark structure.
   Identify silhouettes by value first, color second.
3. **Limited palette.** Sprites use ~4-16 colors. A color that's "off-palette"
   for an object is a strong signal something is wrong (wrong sprite, overlay
   bleed, palette bug).
4. **Hue-shifted shadows.** Shadows are darker *and* shifted in hue (often cooler),
   not just black. Don't mistake a legitimate shadow color for a different object.
5. **Dithering = checkerboard pixels** simulating a shade/gradient. Read it as one
   surface, not as texture/noise.
6. **Hard edges are normal.** Aliased "staircase" edges are correct for sprites at
   this scale, not a rendering defect.

---

## 4. The reliable method: compare against the real sprite

Eyeballing pixel art has a low accuracy ceiling. The reliable move is to **fetch
the actual extracted sprite and compare.** The game's own sprites are extracted
from the user's ROM to PNG, which §5 covers. If the user says "Link should be here but
looks wrong," fetch the reference sprite, confirm its true size/silhouette/palette,
then judge the screenshot against that ground truth.

---

## 5. Where reference sprites live

Extracted by `apps/desktop/electron/sprites/ipc-handlers.ts` via
`shared/asset-extraction/item-sprites/`, driven by
`shared/game/sprites/definitions.json`.

- **Location:** `%AppData%\relic-of-the-past\sprites\<rom-stem>\<file>.png`
  (Windows resolved: `C:\Users\<user>\AppData\Roaming\relic-of-the-past\sprites\...`).
- **Read them directly** with the Read tool (they're PNGs; Read renders images).
- ⚠️ **Path drift:** older builds wrote to `%AppData%\alttp-pc\sprites\...`. If the
  `relic-of-the-past` folder is empty, sprites may only exist under `alttp-pc`,
  or need re-extraction in-app (ROM screen → extract sprites).

### What IS extracted (250 definitions)

HUD elements, item icons, pause-menu icons, fonts, item drops, receipt sprites.
Categories: `hud`, `hud-item`, `hud-pause`, `fonts`, `drop`, `receipt`.

### What is NOT extracted yet (the gap)

**No Link character sprite, no enemies/NPCs, no overworld/dungeon map tiles.**
These are exactly the sprites most relevant to overlay/pathfinding bugs. They are
added **iteratively, on demand** under the standing rule below.

---

## 6. Standing rule for missing sprites

When interpreting a screenshot would be more reliable with a reference sprite that
**is not currently extracted**, do not guess and move on. **Raise a flag**: name
the specific sprite needed (e.g. "Link walking south, green tunic" or "overworld
grass Map16 tile") and ask the user to extract it, so the reference library, and its
accuracy, grow over time. Extraction is done one-at-a-time as needed, never as a
bulk pass. This rule is mirrored in the root `CLAUDE.md` so it always applies.
