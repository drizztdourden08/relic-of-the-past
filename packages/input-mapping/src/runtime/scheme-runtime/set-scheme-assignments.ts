/* @layer renderer-lib @kind logic */
import type { ModernScheme } from '@rotp/game-data';
import { schemeRuntime } from './scheme-runtime-state';

const setSchemeAssignments = (assignments: ModernScheme): void => {
  schemeRuntime.assignments = assignments;
};

export { setSchemeAssignments };
