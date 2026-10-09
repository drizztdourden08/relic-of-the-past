/* @layer renderer-components @kind logic */
import { createContext } from 'react';
import { NONE } from './grid-solve.constants';
import type { GridSolveLookup } from './grid-solve.type';

const GridSolveContext = createContext<GridSolveLookup>(NONE);

export { GridSolveContext };
