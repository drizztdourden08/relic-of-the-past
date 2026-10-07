/* @layer renderer-hud @kind constants */
/**
 * The meter's geometry and its three colours.
 *
 * The colours are taken from the console's own palette instead of the app's
 * design tokens. This is emulated hardware output sitting on top of emulated
 * hardware output: a token that shifts with the app theme would put a
 * UI-coloured bar over game-coloured pixel art. The design system's tokens stay
 * the source of truth for the app chrome; the HUD answers to the console.
 *
 * The SHAPE is not the console's. 80x16 (5:1) is a clean modern meter sitting
 * directly under the heart row and exactly as wide as it, instead of the
 * console's tall jar (which cannot sit under a life row without pushing every
 * element below it down) or the 82x8 hairline that replaced the jar first.
 *
 * There is no fourth colour, because there is no track: 80x16 is the bar AT
 * FULL, and a bar carrying less is shorter, not emptier, so no pixel is
 * ever painted "behind" the part that is missing. See `HudMagicBar`.
 */

/** SNES px, at full. 5:1, and the same 80 the heart row is wide, so the two
 *  share an edge. It is also the lane the element reserves at every value. */
const BAR_WIDTH = 80;
const BAR_HEIGHT = 16;
/** The surround, one pixel on every side, at every length. */
const BAR_FRAME = 1;
/** Slight, per the reference. Enough to soften the corner, not a pill. It is
 *  authored against the bar at full; `HudMeter` shortens it with the bar so a
 *  stub keeps a softened corner instead of becoming a lozenge. */
const BAR_RADIUS = 2.5;

/** Full magic in the save's own units. */
const MAGIC_MAX = 128;

/** The bar itself. */
const MAGIC_GREEN = '#00d800';
/** A lighter band across the top of each band, so the bar has a light source. */
const MAGIC_SHEEN = '#7cf05c';
/** The thin dark border, so the bar reads over any background under it. It also
 *  rules the two bands apart under the half-magic upgrade. */
const MAGIC_FRAME_COLOR = '#101010';

const MAGIC_SHEEN_OPACITY = 0.3;

export {
  BAR_FRAME, BAR_HEIGHT, BAR_RADIUS, BAR_WIDTH,
  MAGIC_FRAME_COLOR, MAGIC_GREEN, MAGIC_MAX, MAGIC_SHEEN, MAGIC_SHEEN_OPACITY,
};
