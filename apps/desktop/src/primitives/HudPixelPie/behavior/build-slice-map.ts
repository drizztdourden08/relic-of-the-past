/* @layer renderer-hud @kind logic */
import { FULL_TURN, MAX_PUSH, RING_WIDTH } from '../HudPixelPie.constants';
import type { SliceMap } from '../HudPixelPie.type';
import { markSliceCell } from './mark-slice-cell';

const buildSliceMap = (gridSize: number, sliceCount: number): SliceMap => {
  const count = Math.max(1, Math.floor(sliceCount));
  const centre = Math.floor(gridSize / 2);
  const discRadius = centre - MAX_PUSH;
  const geometry = { count, step: FULL_TURN / count, discRadius, sliceRadius: discRadius - RING_WIDTH };
  const cells = gridSize * gridSize;
  const map: SliceMap = {
    gridSize, sliceCount: count,
    owner: new Int8Array(cells).fill(-1), outline: new Uint8Array(cells),
    backing: new Uint8Array(cells), rim: new Uint8Array(cells), hub: new Uint8Array(cells),
  };

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      markSliceCell(map, geometry, { cell: y * gridSize + x, px: x - centre, py: y - centre });
    }
  }
  return map;
};

export { buildSliceMap };
