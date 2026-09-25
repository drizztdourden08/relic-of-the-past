/* @layer shared-types @kind types */
/**
 * `shape` is a small vector picture with a fractional fill: the one leaf this
 * phase had to add, not compose, because the two things it draws are
 * not a sprite, a switch or a tint.
 *
 * WHY THIS EXISTS (phase 5 of `plans/hud-data-binding.html`, "Presets, and
 * deleting the black boxes"). The plan's own worked example assumed a heart
 * was a choice between four sprite files (full/half/quarter/empty). The
 * SHIPPED enhanced HUD draws a heart a different way: `HudHeart` is a curved
 * SVG silhouette, clipped at an arbitrary FRACTION of its width (not one of a
 * few discrete states) and tinted on its rim/highlight/shaded-flank by the
 * armour tier. `HudBoxStyle`'s `tint` cannot produce this, because a CSS/SVG
 * filter tints a RASTER image's existing pixels, and there is no raster image
 * here to tint; the picture is the curve itself. Likewise `HudMeter` (the
 * magic bar) is a rounded bar whose own LENGTH is the value, split into
 * banded sheens for the half-magic upgrade. That is reproducible in the STYLE system
 * for the plain one-band case (a bound `radius`, a gradient `background`,
 * a bound `size.w`), but the two-band split is a second, separately-lit
 * region of the same short bar, which is what `shape` draws instead of
 * asking the style system to grow a second concept for one meter.
 *
 * So: two named pictures, not a general "vector shape" facility. That is the same
 * restraint `hud-text.ts` used for its own two faces. Both keep the exact
 * artwork, palette and thresholds the compounds they replace already drew;
 * nothing about how a heart or the magic bar LOOKS changed, only how the tree
 * reaches it. See `HudShape` (the renderer) for the drawing itself.
 */

import type { Value } from './hud-value';

type HudShapeKind = 'heart' | 'magic-bar';

interface HudShapeSpec {
  type: 'shape';
  shape: HudShapeKind;
  /** How full, 0-1. A `heart`'s own fill quantises at render time when the
   *  player's heart-mode setting says `'original'`; a `magic-bar` always
   *  reads it continuously, matching what `HudMagicBar` always did. */
  fill: Value;
  /** `heart` only. Armour tier 0-2, which tints the rim, the highlight and the
   *  shaded flank exactly as `HudHeart`'s own tint tiers do. Absent reads 0. */
  armor?: Value;
  /** `magic-bar` only. 1 (default, plain) or 2 for the half-magic upgrade's
   *  two stacked bands, each with its own sheen. */
  bands?: Value;
}

export type { HudShapeKind, HudShapeSpec };
