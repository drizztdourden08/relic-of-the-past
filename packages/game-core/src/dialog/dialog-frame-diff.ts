/* @layer bridge-wasm @kind logic */
import type { DialogCell, DialogFrame } from '@rotp/game-data';
import { DIALOG_FRAME_FIELDS } from './dialog-frame-diff.constants';

const cellChanged = (a: DialogCell, b: DialogCell | undefined): boolean =>
  b?.glyph !== a.glyph || a.x !== b.x || a.w !== b.w || a.highlight !== b.highlight;

const rowChanged = (a: DialogCell[], b: DialogCell[] | undefined): boolean => {
  if (b?.length !== a.length) return true;
  return a.some((cell, i) => cellChanged(cell, b[i]));
};

const dialogFrameChanged = (prev: DialogFrame, next: DialogFrame): boolean => {
  if (DIALOG_FRAME_FIELDS.some((field) => prev[field] !== next[field])) return true;
  return prev.rows.some((row, i) => rowChanged(row, next.rows[i]));
};

export { dialogFrameChanged };
