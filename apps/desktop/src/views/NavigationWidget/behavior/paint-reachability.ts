/* @layer renderer-widgets @kind logic */
import { FULL_BOUNDS } from '../sub-components/ReachabilityCanvas.constants';
import type { ReachabilityCanvasProps } from '../sub-components/ReachabilityCanvas.type';
import { reachShade } from './reach-shade';

const paintReachability = (
  canvas: HTMLCanvasElement,
  { reachable, bounds = FULL_BOUNDS, tileLayer }: Pick<ReachabilityCanvasProps, 'reachable' | 'bounds' | 'tileLayer'>,
): void => {
  const { minRow, maxRow, minCol, maxCol } = bounds;
  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = ctx.createImageData(cols, rows);
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const shade = reachShade(reachable[r]?.[c] ?? 0, tileLayer?.[r]?.[c]);
      const off = ((r - minRow) * cols + (c - minCol)) * 4;
      img.data[off] = shade;
      img.data[off + 1] = shade;
      img.data[off + 2] = shade;
      img.data[off + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
};

export { paintReachability };
