/* @layer bridge-wasm @kind logic */
/**
 * Decode the dialog mirror snapshot (core/game-hooks/dialog_mirror.c) into a DialogFrame.
 *
 * Header, 20 bytes: 0 active, 1 flags (bit0 bordered, bit1 story, bit2 native box withheld), 2-3 top-left word address,
 * 4 render state, 5 last command, 6 choice index, 7 scroll step, 8-9 message id, 10-12 cells per
 * row, 13 generation, 14 the message's widest row, 15 its most rows, 16-17 and 18-19 the text layer's
 * signed horizontal and vertical scroll. Then 3 rows of 40 cells of (glyph, x, w).
 */
import type { DialogCell, DialogFrame } from '@shared/game/dialog/dialog-frame.types';
import { kindOf } from '@shared/game/dialog/dialog-kind';
import { waitOf } from '@shared/game/dialog/dialog-wait';
import { readU16 } from '../bridge/wasm-call';

const HEADER_BYTES = 20;
const ROWS = 3;
const CELLS_PER_ROW = 40;
const CELL_BYTES = 3;

const readRow = (heap: Uint8Array, base: number, count: number): DialogCell[] => {
  const cells: DialogCell[] = [];
  for (let i = 0; i < Math.min(count, CELLS_PER_ROW); i++) {
    const at = base + i * CELL_BYTES;
    cells.push({ glyph: heap[at], x: heap[at + 1], w: heap[at + 2] });
  }
  return cells;
};

const parseDialogState = (heap: Uint8Array, ptr: number): DialogFrame => {
  const flags = heap[ptr + 1];
  const topleft = readU16(heap, ptr + 2);
  const rows: DialogCell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(readRow(heap, ptr + HEADER_BYTES + r * CELLS_PER_ROW * CELL_BYTES, heap[ptr + 10 + r]));
  }
  return {
    active: heap[ptr] !== 0,
    kind: kindOf((flags & 1) !== 0, (flags & 2) !== 0, topleft),
    topleft,
    rows,
    scrollStep: heap[ptr + 7],
    wait: waitOf(heap[ptr + 5]),
    choice: heap[ptr + 6],
    messageId: readU16(heap, ptr + 8),
    renderState: heap[ptr + 4],
    nativeHidden: (flags & 4) !== 0,
    generation: heap[ptr + 13],
    messageWidth: heap[ptr + 14],
    messageRows: heap[ptr + 15],
    layerScrollX: (readU16(heap, ptr + 16) << 16) >> 16,
    layerScrollY: (readU16(heap, ptr + 18) << 16) >> 16,
  };
};

const INACTIVE_FRAME: DialogFrame = {
  active: false, kind: 'box', topleft: 0, rows: [[], [], []], scrollStep: 0,
  wait: 'none', choice: 0, messageId: 0, renderState: 0, nativeHidden: false, generation: 0,
  messageWidth: 0, messageRows: 0,
  layerScrollX: 0, layerScrollY: 0,
};

export { parseDialogState, INACTIVE_FRAME };
