/* @layer renderer-components @kind types */
import type { HudGridContainer } from '@rotp/hud';

interface GridSolve {
  columns: readonly number[];
  rows: readonly number[];
}

type GridSolveLookup = (container: HudGridContainer) => GridSolve | null;

export type { GridSolve, GridSolveLookup };
