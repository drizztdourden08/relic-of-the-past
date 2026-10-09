/* @layer renderer-hud @kind constants */
import type { PauseAction } from './PauseStatusScreen.type';

const STATUS_BOX_COLS = 25;
const STATUS_BOX_ROWS = 16;

const LABEL_GLYPH = 6;
const VALUE_X = 56;

const LIFE_Y = 0;
const PIECES_X = 96;
const PIECES_ICON_X = 136;
const MAGIC_Y = 32;
const PENDANTS_Y = 48;
const CRYSTALS_Y = 72;
const DUNGEON_Y = 96;
const ACTIONS_Y = 116;

const ICON_PITCH = 24;
const ICON_SIZE = 16;
const CRYSTAL_PITCH = 18;
const CRYSTAL_DROP = 4;

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

const PENDANT_VARIANTS = ['red', 'blue', 'green'] as const;
const CRYSTAL_COUNT = 7;
const MAGIC_ROW_DROP = 1;

const ACTIONS: readonly { id: PauseAction; label: string }[] = [
  { id: 'continue', label: ACTION_LABELS.continue },
  { id: 'save-quit', label: ACTION_LABELS.saveQuit },
];

export {
  ACTIONS, ACTIONS_Y, ACTION_GLYPH, ACTION_LABELS, ACTION_PAD, ACTION_PITCH, ACTION_X,
  CRYSTALS_Y, CRYSTAL_COUNT, CRYSTAL_DROP, CRYSTAL_PITCH, DUNGEON_Y, ICON_PITCH, ICON_SIZE,
  LABEL_GLYPH, LIFE_Y, MAGIC_ROW_DROP, MAGIC_Y, PENDANT_VARIANTS, PENDANTS_Y, PIECES_ICON_X, PIECES_X,
  ROW_LABELS, STATUS_BOX_COLS, STATUS_BOX_ROWS, VALUE_X,
};
