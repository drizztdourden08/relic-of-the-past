/* @layer tests @kind helper */
import { solveGrid } from '@rotp/hud';
import type { GridSolve } from '@app/hud-layout-editing/grid-solve';
import type { HudGridContainer } from '@rotp/hud';
import { CTX, VIEW } from './metrics.constants';

const solveOf = (container: HudGridContainer): GridSolve => {
  const { colSizes, rowSizes } = solveGrid(container, VIEW, 1, CTX);
  return { columns: colSizes, rows: rowSizes };
};

export { solveOf };
