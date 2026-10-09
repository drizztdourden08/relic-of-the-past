/* @layer renderer-components @kind constants */
import type { GridSolve, GridSolveLookup } from './grid-solve.type';

const NONE: GridSolveLookup = () => null;

const EMPTY: GridSolve = { columns: [], rows: [] };

export { EMPTY, NONE };
