/* @layer renderer-components @kind types */
import type { HudGridContainer } from '@shared/types/hud';

interface GridSolve {
  columns: readonly number[];
  rows: readonly number[];
}

type GridSolveLookup = (container: HudGridContainer) => GridSolve | null;

export type { GridSolve, GridSolveLookup };
