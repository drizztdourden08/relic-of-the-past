/* @layer renderer-hud @kind constants */
/**
 * True-scale geometry and row wording for the status screen, in SNES pixels
 * from the screen area's own top-left corner.
 *
 * The published plan measures this panel at 216x144 OUTSIDE its frame, which
 * is 25x16 tiles of content: 200x128, holding seven rows and the two actions.
 *
 * The row words are plain English constants, not name-table lookups: the
 * shipped table keys only the six pre-composed label strips the console itself
 * drew, and none of these rows existed there. Adding keys is a change to the
 * language types, which belong to another part of the tree.
 */

/** Content of the status box in tiles. 25x16 tiles = 200x128. */
const STATUS_BOX_COLS = 25;
const STATUS_BOX_ROWS = 16;

/** Row labels are half-height, so the widest fits the column before the values. */
const LABEL_GLYPH = 6;
/** Where every row's value starts. */
const VALUE_X = 56;

/** Vertical position of each row. The life block owns the top and is 25 tall. */
const LIFE_Y = 0;
const PIECES_X = 96;
const PIECES_ICON_X = 136;
const MAGIC_Y = 32;
const PENDANTS_Y = 48;
const CRYSTALS_Y = 72;
const DUNGEON_Y = 96;
const ACTIONS_Y = 116;

/** Icon pitches: full cells on 24, the half-height crystals packed tighter. */
const ICON_PITCH = 24;
const ICON_SIZE = 16;
const CRYSTAL_PITCH = 18;
/** A crystal's sprite is 16x8, so its row sits half a cell lower to centre it. */
const CRYSTAL_DROP = 4;

/** The two actions, side by side, at a full tile so they read as buttons. */
const ACTION_GLYPH = 8;
const ACTION_PITCH = 92;
const ACTION_X = 4;
const ACTION_PAD = 2;

const ROW_LABELS = {
  pieces: 'PIECES',
  magic: 'MAGIC',
  pendants: 'PENDANTS',
  crystals: 'CRYSTALS',
  dungeon: 'DUNGEON',
} as const;

const ACTION_LABELS = { continue: 'CONTINUE', saveQuit: 'SAVE & QUIT' } as const;

export {
  ACTIONS_Y, ACTION_GLYPH, ACTION_LABELS, ACTION_PAD, ACTION_PITCH, ACTION_X,
  CRYSTALS_Y, CRYSTAL_DROP, CRYSTAL_PITCH, DUNGEON_Y, ICON_PITCH, ICON_SIZE,
  LABEL_GLYPH, LIFE_Y, MAGIC_Y, PENDANTS_Y, PIECES_ICON_X, PIECES_X,
  ROW_LABELS, STATUS_BOX_COLS, STATUS_BOX_ROWS, VALUE_X,
};
