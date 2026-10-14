/* @layer renderer-components @kind logic */
import { STAIRS_TRAVERSAL_STATE } from '@rotp/navigation';
import { drawDoubleArrow } from './draw-double-arrow';
import type { StairRunInput } from './draw-stair-run.type';
import { isVerticalSpanOffscreen } from './is-vertical-span-offscreen';
import { stairRunEnd } from './stair-run-end';

const drawStairRun = (input: StairRunInput): void => {
  const { dc, drawResult, origin, visited, r, c } = input;
  if (drawResult.reachable[r]?.[c] !== STAIRS_TRAVERSAL_STATE) return;
  if (visited.has(`${r},${c}`)) return;
  const maxR = stairRunEnd(drawResult.reachable, r, c, visited);
  if (maxR - r < 1) return;

  const { scaleX, scaleY, viewLeft, viewTop, TILE_PX } = dc;
  const columnCenterX = origin.x + c * TILE_PX + TILE_PX / 2 - viewLeft;
  const startSY = origin.y + r * TILE_PX - viewTop;
  const endSY = origin.y + (maxR + 1) * TILE_PX - viewTop;
  if (isVerticalSpanOffscreen(dc, startSY, endSY)) return;

  drawDoubleArrow(dc, { x1: columnCenterX * scaleX, y1: startSY * scaleY, x2: columnCenterX * scaleX, y2: endSY * scaleY });
};

export { drawStairRun };
