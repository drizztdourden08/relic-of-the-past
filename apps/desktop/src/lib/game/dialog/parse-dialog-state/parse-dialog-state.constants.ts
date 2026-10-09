/* @layer bridge-wasm @kind constants */
import type { DialogFrame } from '@rotp/game-data';

const HEADER_BYTES = 20;
const ROWS = 3;
const CELLS_PER_ROW = 40;
const CELL_BYTES = 3;
const CELL_WIDTH_MASK = 0x0f;
const CELL_HIGHLIGHT_SHIFT = 4;

const OFFSET_ACTIVE = 0;
const OFFSET_FLAGS = 1;
const OFFSET_TOPLEFT = 2;
const OFFSET_RENDER_STATE = 4;
const OFFSET_LAST_COMMAND = 5;
const OFFSET_CHOICE = 6;
const OFFSET_SCROLL_STEP = 7;
const OFFSET_MESSAGE_ID = 8;
const OFFSET_ROW_CELL_COUNTS = 10;
const OFFSET_GENERATION = 13;
const OFFSET_MESSAGE_WIDTH = 14;
const OFFSET_MESSAGE_ROWS = 15;
const OFFSET_SCROLL_X = 16;
const OFFSET_SCROLL_Y = 18;

const FLAG_BORDERED = 1;
const FLAG_STORY = 2;
const FLAG_NATIVE_HIDDEN = 4;

const INACTIVE_FRAME: DialogFrame = {
  active: false, kind: 'box', topleft: 0, rows: [[], [], []], scrollStep: 0,
  wait: 'none', choice: 0, messageId: 0, renderState: 0, nativeHidden: false, generation: 0,
  messageWidth: 0, messageRows: 0,
  layerScrollX: 0, layerScrollY: 0,
};

export {
  HEADER_BYTES, ROWS, CELLS_PER_ROW, CELL_BYTES, CELL_WIDTH_MASK, CELL_HIGHLIGHT_SHIFT,
  OFFSET_ACTIVE, OFFSET_FLAGS, OFFSET_TOPLEFT, OFFSET_RENDER_STATE, OFFSET_LAST_COMMAND, OFFSET_CHOICE,
  OFFSET_SCROLL_STEP, OFFSET_MESSAGE_ID, OFFSET_ROW_CELL_COUNTS, OFFSET_GENERATION, OFFSET_MESSAGE_WIDTH,
  OFFSET_MESSAGE_ROWS, OFFSET_SCROLL_X, OFFSET_SCROLL_Y,
  FLAG_BORDERED, FLAG_STORY, FLAG_NATIVE_HIDDEN,
  INACTIVE_FRAME,
};
