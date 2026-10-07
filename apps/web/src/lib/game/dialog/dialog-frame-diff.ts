/* @layer bridge-wasm @kind logic */
/** Cheap frame comparison so the store only updates when the box actually changed. */
import type { DialogCell, DialogFrame } from '@shared/game/dialog/dialog-frame.types';

const rowChanged = (a: DialogCell[], b: DialogCell[]): boolean => {
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i].glyph !== b[i].glyph || a[i].x !== b[i].x || a[i].w !== b[i].w) return true;
  }
  return false;
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
