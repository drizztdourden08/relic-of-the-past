/* @layer renderer-components @kind logic */
/**
 * THE PANEL'S LATTICE AND THE STAGE READ ONE SOLVE (§50). "Cells should match in
 * size to the row and column" cannot be answered from the track list alone: an
 * `auto` track's size is whatever its widest child measured, a `fill` track's is
 * whatever was left over, and both are `solveGrid`'s answer against a real box
 * and a real `MeasureContext`. It is the same one `StageGridEcho` and `ContainerOverlay`
 * already use. So the View solves once, for every grid on the stage, and hands
 * the answer down.
 *
 * AS A CONTEXT INSTEAD OF A PROP, for `formula-scope.ts`'s reason: it is a fact
 * about the session's preview, not about the selected node, and threading it
 * through `NodeInspector` → `LayoutSection` → `GridTemplateEditor` → `GridEditor`
 * would put a prop nobody on that path reads into four signatures.
 *
 * AN UNSOLVED GRID IS NOT A BROKEN ONE. `null` means "not on the stage right
 * now" (a repeat's template before expansion, a mount in a test), and the
 * lattice falls back to equal shares, which is a truthful "no proportions known"
 * and not a guess.
 */
import { createContext, useContext } from 'react';
import type { HudGridContainer } from '@shared/types/hud';

interface GridSolve {
  /** Solved track sizes in GAME px. They are unit-independent, so the panel may draw
   *  them at any scale it likes. */
  columns: readonly number[];
  rows: readonly number[];
}

type GridSolveLookup = (container: HudGridContainer) => GridSolve | null;

const NONE: GridSolveLookup = () => null;

const GridSolveContext = createContext<GridSolveLookup>(NONE);

const EMPTY: GridSolve = { columns: [], rows: [] };

/** What the lattice asks for: never null, so no caller has to branch. */
const useGridSolve = (container: HudGridContainer): GridSolve =>
  useContext(GridSolveContext)(container) ?? EMPTY;

export { GridSolveContext, useGridSolve };
export type { GridSolve, GridSolveLookup };
