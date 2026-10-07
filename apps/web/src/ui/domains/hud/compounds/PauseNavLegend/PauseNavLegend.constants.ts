/* @layer renderer-hud @kind constants */
/**
 * The legend strip: 398 x 16 SNES pixels along the bottom of the play field,
 * per the published measurements. Everything below is its interior.
 */
import { PAUSE_LEGEND_HEIGHT, PAUSE_LEGEND_LEFT_RESERVE } from '@shared/hud/layouts';

/**
 * Height of the strip - from the layout layer, because a bottom-anchored HUD
 * element has to be placed clear of it and the two are drawn by files that
 * cannot see each other. The wallet in the shipped layout sits IN this band,
 * flush with the bottom edge; a copy of the number here would let the two drift.
 */
const LEGEND_HEIGHT = PAUSE_LEGEND_HEIGHT;
/**
 * Left padding, so the centred pairs start clear of whatever the shipped layout
 * puts in the bottom-left corner. From the same file the layout takes the
 * corner's width from - the arithmetic lives there, with both halves of it.
 *
 * It is a fixed promise, not a reading of the live layout: the chrome does not
 * move out of the HUD's way (that is the whole rule this strip is drawn by), so
 * a player who moves the wallet elsewhere leaves the strip very slightly off
 * centre instead of making it chase them.
 */
const LEGEND_LEFT_RESERVE = PAUSE_LEGEND_LEFT_RESERVE;
/** A glyph, small enough to leave a pixel of air top and bottom. */
const LEGEND_GLYPH = 12;
/** The verb beside it, half a tile so six pairs fit a 4:3 field too. */
const LEGEND_TEXT = 6;
/**
 * Space between one pair and the next.
 *
 * Eight, not the twelve it was, and the four px came out of the air, not
 * out of the words. The strip now shares its row with the bottom-left corner
 * (64 reserved, leaving 334 of the narrowest 398-wide field) and it can carry
 * five pairs at once: SCREEN, MOVE, a confirm verb, ASSIGN and CLOSE, which on
 * a d-pad profile - four separate glyphs for MOVE - measure 294 of content. At
 * twelve the four gaps between them made 342 and ran 8 px past the reserve; at
 * eight they make 32, for 326, and the strip fits its own row at every context
 * the legend can build. Still four times the 2 px inside a pair, so a pair
 * still reads as one thing.
 */
const PAIR_GAP = 8;
/** Space between a glyph and its verb, and between two glyphs of one pair. */
const GLYPH_GAP = 2;
/** A dark plate under the row, so a verb stays readable over any play field. */
const LEGEND_PLATE = 'rgba(0, 0, 0, 0.55)';

export {
  GLYPH_GAP, LEGEND_GLYPH, LEGEND_HEIGHT, LEGEND_LEFT_RESERVE, LEGEND_PLATE, LEGEND_TEXT, PAIR_GAP,
};
