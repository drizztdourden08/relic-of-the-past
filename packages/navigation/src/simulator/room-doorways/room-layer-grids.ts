/* @layer bridge-wasm @kind logic */
import { getScreenGrids } from '../../flood/screen-grids';

const roomLayerGrids = (roomId: number): number[][][] => {
  const bundle = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  return [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
};

export { roomLayerGrids };
