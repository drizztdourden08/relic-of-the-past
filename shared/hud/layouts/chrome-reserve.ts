/* @layer shared-hud @kind constants */
/**
 * The numbers the HUD layout and the pause chrome BOTH answer to.
 *
 * Two layers draw over the same play field and neither can see the other's
 * rectangles: the layout puts five elements wherever the player asked for them,
 * and the enhanced pause menu draws a chrome that never moves - a tab strip
 * above the panels, a legend strip along the bottom - straight through the HUD
 * that stays readable underneath it. Anything the two have to agree on lives
 * here, in the layer both already import, instead of being spelled out twice.
 *
 * That is the whole lesson of the tab strip. It was placed once, against a
 * vitals block measured at the time, in a file the vitals know nothing about -
 * so when the block grew a row the strip stayed exactly where it was and the
 * consumable counts printed across the screen names. A number owned by neither
 * side drifts the moment either side changes.
 */

import { WALLET_SIZE } from './element-sizes';

/** What a fixed element or strip keeps clear of the play field's border. */
const HUD_EDGE_INSET = 8;

/**
 * The legend strip: the full width of the play field along the bottom, 16 px
 * tall - the height `PauseNavLegend` draws itself at, which reads this.
 *
 * Sixteen is also exactly the height of the corner it stands in. In 224-line
 * mode the menu's panels reach y 200 and this strip starts at 208, leaving 8 px
 * of clear field between them - which no 16px element fits in at any offset. So
 * a bottom-left element does not sit ABOVE the strip; it sits IN it, on the
 * strip's own plate, flush with the bottom edge. That answer is height-blind by
 * construction: measured up from the bottom, the band is the last 16 rows at
 * 224 lines and at 240 alike, and the extra 16 rows of a 240-line field become
 * clear air above the wallet instead of a second geometry to get right.
 */
const PAUSE_LEGEND_HEIGHT = 16;

/**
 * What the legend keeps clear at its LEFT end, so a bottom-left HUD element and
 * the strip can share one row.
 *
 * The collision this solves was measured: 36 px of x-overlap and 6 of y between
 * the wallet and the leftmost legend glyph. The strip's pairs are centred, so
 * its left end moves with its own content and cannot be reasoned about from the
 * wallet's side alone - reserving the width here, in the file both layers
 * already answer to, is what makes it arithmetic instead of a nudge.
 *
 *   wallet          8 inset + 48 wide  -> occupies x 8..56
 *   this reserve    8 + 48 + 8         -> 64, one more inset of air
 *   strip          398 - 64            -> 334 px for the pairs, centred in it
 *
 * 48 is the FOUR-digit wallet (a 16px icon plus four 8px digits); at three
 * digits it is 40 and the air grows to 16. So the reserve is taken at the
 * widest count the cap can produce and is never the tight case.
 *
 * The widest strip the legend can now build is 326 px - five pairs at their
 * longest words, on a pad whose movement is a four-glyph d-pad - which leaves
 * its leftmost glyph at 64 + (334-326)/2 = 68, twelve px clear of the wallet.
 * 398 is the narrowest field a host-drawn style allows (16:9 at 224 lines); every wider
 * display only adds slack, because the reserve is fixed and the strip is not.
 */
const PAUSE_LEGEND_LEFT_RESERVE = HUD_EDGE_INSET + WALLET_SIZE.w + HUD_EDGE_INSET;

export { HUD_EDGE_INSET, PAUSE_LEGEND_HEIGHT, PAUSE_LEGEND_LEFT_RESERVE };
