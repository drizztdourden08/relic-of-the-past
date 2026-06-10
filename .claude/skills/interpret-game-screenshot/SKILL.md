<!-- @layer claude-config @kind doc -->
---

name: interpret-game-screenshot
description: Correctly read a screenshot of the running ALttP game — overlays, pathfinding/navigation grids, Link's position, HUD, sprites, tiles. Use whenever the user shares a game screenshot to explain a bug or state, especially "X is offset / wrong / not where it should be", overlay alignment issues, or any visual that's been hard to convey. Reads low-res pixel art at scale and compares against extracted reference sprites instead of guessing
---

# Interpret a game screenshot

Reading pixel art at scale has a low accuracy ceiling if you just "look." Follow
this protocol so something wrong is not read as fine. Background knowledge:
@docs/architecture/rendering-pixel-art.md.

## Protocol

### 1. Establish scale & crispness first

- Native frame is **256×224**, upscaled to the window. Decide: do pixels look
  **crisp** (integer-scaled, clean squares) or **blurry** (fractional/bilinear)?
- If blurry: reason in **whole tiles**, not screen pixels, and don't infer
  sub-pixel detail from edges. Ask for a 1×/integer-scaled crop if fine detail matters.

### 2. Lock onto the tile grid

- Base tile **8×8 px**; map/collision tile **16×16 px**; screen/room **512×512 px**
  (64×64 base tiles). Link is **~16px ≈ 2 tiles** wide.
- Express positions as **tile cells**, not vague location. "Link occupies the cell
  ~2 tiles from the left edge" beats "Link is on the left."

### 3. Read region by region (don't gestalt)

- HUD band (top) → values: hearts, magic, rupees, item box.
- Play field → Link, sprites/enemies, doors, tile features.
- Overlay layer → the pathfinding/navigation grid, glow, markers drawn ON TOP by
  the TS app. Distinguish *game pixels* from *overlay pixels* (overlays are usually
  flat, semi-transparent, or single-color — off the sprite palette).

### 4. Apply pixel-art reading rules

- Identify shapes by **value/silhouette** first, color second.
- A color **off the object's limited palette** = signal (wrong sprite, overlay
  bleed, palette bug), not noise.
- Checkerboard = **dithering** (one shaded surface); aliased edges = normal.
- Every differing pixel is **intentional** — don't dismiss single-pixel diffs.

### 5. Compare against the real sprite (the reliable step)

When the question is "is this sprite right / correctly placed," fetch the actual
extracted reference and compare:

- Path: `%AppData%\relic-of-the-past\sprites\<rom-stem>\<file>.png`
  (`C:\Users\<user>\AppData\Roaming\relic-of-the-past\sprites\...`; fallback
  `alttp-pc\sprites\...` on older builds).
- List what's available with Glob, then **Read the PNG** (Read renders images).
- Confirm the sprite's true size, silhouette, and palette, THEN judge the
  screenshot against that ground truth — its offset, mirroring, wrong tile, etc.
- Sprite names come from `shared/game/sprites/definitions.json` (`file` field).

### 6. If the needed sprite isn't extracted — FLAG IT (do not guess)

Only HUD/item/menu/font/drop/receipt sprites are extracted today. **Link,
enemies, NPCs, and overworld/dungeon tiles are NOT.** If reading the screenshot
reliably needs one of these:

- **Stop and raise a flag.** Name the exact sprite ("Link walking south",
  "soldier/guard sprite", "overworld grass Map16 tile") and ask the user to
  extract it in-app so the reference library grows.
- Do this **iteratively, one sprite at a time, as needed** — never request a bulk
  extraction. (Standing rule, also in root `CLAUDE.md`.)

### 7. State confidence honestly

Say what you concluded, what you compared against, and where you're uncertain
(e.g. "blurry upscale — can't confirm the 1px gap; reasoning at tile level").
Never report something ambiguous as confirmed.

## Anti-patterns

- ❌ "Looks fine to me" without locating the tile grid or comparing a reference.
- ❌ Reading screen pixels as source pixels on a blurry/fractional upscale.
- ❌ Guessing at Link/enemy placement when that sprite isn't extracted — flag instead.
