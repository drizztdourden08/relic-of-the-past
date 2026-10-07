/* @layer renderer-hud @kind constants */
/**
 * The enhanced pause menu's shared text metrics and palette.
 *
 * Colours come from the console's own menu palette instead of the app's design
 * tokens, for the same reason the magic meter's do: this is UI drawn on top of
 * emulated hardware output, and a token that follows the app theme would put an
 * app-coloured frame around game-coloured pixel art. The HUD answers to the
 * console; the design tokens stay the source of truth for the app chrome.
 */

/** One character of the game's font occupies one 8x8 tile. */
const GLYPH_SIZE = 8;

/** '&' is drawn across two native tiles, so its sprite is twice as wide. */
const AMPERSAND_COLUMNS = 2;

/** The menu green the console uses for its own cursor and selection marks. */
const PAUSE_FOCUS_COLOR = '#00d800';

/** How far an unselectable or unowned element is faded. */
const PAUSE_DIM_OPACITY = 0.45;

export { AMPERSAND_COLUMNS, GLYPH_SIZE, PAUSE_DIM_OPACITY, PAUSE_FOCUS_COLOR };
