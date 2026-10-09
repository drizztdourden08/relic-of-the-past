/* @layer bridge-wasm @kind logic */
import { getScreenGrids } from '../../flood/screen-grids';
import type { Edge } from './probe-room-anchors.type';

const passable = (a: number): boolean => a === 0x00 || (a >= 0x80 && a <= 0x8d) || (a >= 0x90 && a <= 0xaf);

const edgeOpenCount = (roomId: number, edge: Edge): number => {
  const bundle = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  let open = 0;
  for (let p = 0; p < 64; p++) {
    const r = edge === 'north' ? 0 : edge === 'south' ? 63 : p;
    const c = edge === 'west' ? 0 : edge === 'east' ? 63 : p;
    if (grids.some((g) => passable(g[r]?.[c] ?? 1))) open += 1;
  }
  return open;
};

export { edgeOpenCount };
