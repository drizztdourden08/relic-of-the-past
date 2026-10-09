/* @layer shared-game @kind logic */
import type { ScreenGridBundle } from '../../types';

const attrGridsOf = (bundle: ScreenGridBundle): number[][][] =>
  [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];

export { attrGridsOf };
