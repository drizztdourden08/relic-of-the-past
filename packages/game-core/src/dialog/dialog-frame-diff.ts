/* @layer bridge-wasm @kind logic */
import type { DialogCell, DialogFrame } from '@rotp/game-data';

const cellChanged = (a: DialogCell, b: DialogCell | undefined): boolean =>
  b === undefined || a.glyph !== b.glyph || a.x !== b.x || a.w !== b.w || a.highlight !== b.highlight;

const rowChanged = (a: DialogCell[], b: DialogCell[] | undefined): boolean => {
  if (b === undefined || a.length !== b.length) return true;
  return a.some((cell, i) => cellChanged(cell, b[i]));
};

const dialogFrameChanged = (prev: DialogFrame, next: DialogFrame): boolean => {
  if (prev.active !== next.active || prev.kind !== next.kind || prev.topleft !== next.topleft) return true;
  if (prev.scrollStep !== next.scrollStep || prev.wait !== next.wait || prev.choice !== next.choice) return true;
  if (prev.messageId !== next.messageId || prev.renderState !== next.renderState || prev.generation !== next.generation) return true;
  if (prev.nativeHidden !== next.nativeHidden) return true;
  if (prev.layerScrollX !== next.layerScrollX || prev.layerScrollY !== next.layerScrollY) return true;
  return prev.rows.some((row, i) => rowChanged(row, next.rows[i]));
};

export { dialogFrameChanged };
