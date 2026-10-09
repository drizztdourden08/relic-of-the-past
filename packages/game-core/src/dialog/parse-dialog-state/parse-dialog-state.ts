/* @layer bridge-wasm @kind logic */
import type { DialogCell, DialogFrame } from '@rotp/game-data';
import { kindOf, waitOf } from '@rotp/game-data';
import { readU8, readU16 } from '../../bridge/wasm-call';
import {
  CELL_BYTES, CELL_HIGHLIGHT_SHIFT, CELL_WIDTH_MASK, CELLS_PER_ROW, FLAG_BORDERED, FLAG_NATIVE_HIDDEN, FLAG_STORY,
  HEADER_BYTES, OFFSET_ACTIVE, OFFSET_CHOICE, OFFSET_FLAGS, OFFSET_GENERATION, OFFSET_LAST_COMMAND,
  OFFSET_MESSAGE_ID, OFFSET_MESSAGE_ROWS, OFFSET_MESSAGE_WIDTH, OFFSET_RENDER_STATE, OFFSET_ROW_CELL_COUNTS,
  OFFSET_SCROLL_STEP, OFFSET_SCROLL_X, OFFSET_SCROLL_Y, OFFSET_TOPLEFT, ROWS,
} from './parse-dialog-state.constants';

const signed16 = (word: number): number => (word << 16) >> 16;

const readRow = (heap: Uint8Array, base: number, count: number): DialogCell[] => {
  const cells: DialogCell[] = [];
  for (let i = 0; i < Math.min(count, CELLS_PER_ROW); i++) {
    const at = base + i * CELL_BYTES;
    const width = readU8(heap, at + 2);
    cells.push({ glyph: readU8(heap, at), x: readU8(heap, at + 1), w: width & CELL_WIDTH_MASK, highlight: width >> CELL_HIGHLIGHT_SHIFT });
  }
  return cells;
};

const parseDialogState = (heap: Uint8Array, ptr: number): DialogFrame => {
  const flags = readU8(heap, ptr + OFFSET_FLAGS);
  const topleft = readU16(heap, ptr + OFFSET_TOPLEFT);
  const rows: DialogCell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(readRow(heap, ptr + HEADER_BYTES + r * CELLS_PER_ROW * CELL_BYTES, readU8(heap, ptr + OFFSET_ROW_CELL_COUNTS + r)));
  }
  return {
    active: heap[ptr + OFFSET_ACTIVE] !== 0,
    kind: kindOf((flags & FLAG_BORDERED) !== 0, (flags & FLAG_STORY) !== 0, topleft),
    topleft,
    rows,
    scrollStep: readU8(heap, ptr + OFFSET_SCROLL_STEP),
    wait: waitOf(readU8(heap, ptr + OFFSET_LAST_COMMAND)),
    choice: readU8(heap, ptr + OFFSET_CHOICE),
    messageId: readU16(heap, ptr + OFFSET_MESSAGE_ID),
    renderState: readU8(heap, ptr + OFFSET_RENDER_STATE),
    nativeHidden: (flags & FLAG_NATIVE_HIDDEN) !== 0,
    generation: readU8(heap, ptr + OFFSET_GENERATION),
    messageWidth: readU8(heap, ptr + OFFSET_MESSAGE_WIDTH),
    messageRows: readU8(heap, ptr + OFFSET_MESSAGE_ROWS),
    layerScrollX: signed16(readU16(heap, ptr + OFFSET_SCROLL_X)),
    layerScrollY: signed16(readU16(heap, ptr + OFFSET_SCROLL_Y)),
  };
};

export { parseDialogState };
