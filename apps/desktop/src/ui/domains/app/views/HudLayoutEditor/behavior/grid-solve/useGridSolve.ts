/* @layer renderer-components @kind hook */
import { useContext } from 'react';
import { EMPTY } from './grid-solve.constants';
import { GridSolveContext } from './grid-solve-context';
import type { HudGridContainer } from '@shared/types/hud';
import type { GridSolve } from './grid-solve.type';

const useGridSolve = (container: HudGridContainer): GridSolve =>
  useContext(GridSolveContext)(container) ?? EMPTY;

export { useGridSolve };
