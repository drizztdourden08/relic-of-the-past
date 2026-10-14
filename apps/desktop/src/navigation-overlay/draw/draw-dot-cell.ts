/* @layer renderer-components @kind logic */
import type { DotCellInput } from './dot-cell.type';
import { dotCellState } from './dot-cell-state';
import { drawDotDisc } from './draw-dot-disc';
import { drawDotRing } from './draw-dot-ring';
import { hasRequirement } from './has-requirement';
import { isOffscreen } from './is-offscreen';
import { isSuppressedDot } from './is-suppressed-dot';
import { ringColorFor } from './ring-color-for';

const drawDotCell = (input: DotCellInput): void => {
  const { dc, drawResult, origin, perLayer, row, col } = input;
  const { scaleX, scaleY, viewLeft, viewTop, TILE_PX } = dc;
  const state = dotCellState(perLayer, drawResult, row, col);
  if (!state.mergedReachable || isSuppressedDot(input, state)) return;

  const screenX = origin.x + col * TILE_PX + TILE_PX / 2 - viewLeft;
  const screenY = origin.y + row * TILE_PX + TILE_PX / 2 - viewTop;
  if (isOffscreen(dc, screenX, screenY)) return;

  const dx = screenX * scaleX;
  const dy = screenY * scaleY;
  drawDotDisc(dc, dx, dy, hasRequirement(drawResult.reqGrid, row, col));
  drawDotRing(dc, dx, dy, ringColorFor(input, state));
};

export { drawDotCell };
