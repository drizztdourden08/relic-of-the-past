/* @layer bridge-wasm @kind logic */
import { getScreenGrids } from '../../flood';

const gridBuilt = (roomId: number): { raw: boolean; dual: boolean } => {
  const b = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const raw = b.rawAttrGrid.some((r) => r.some((v) => v !== 0));
  const dual = !!b.dualLayerGrids && b.dualLayerGrids.layer0.some((r) => r.some((v) => v !== 0));
  return { raw, dual };
};

export { gridBuilt };
