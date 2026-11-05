/* @layer renderer-components @kind logic */
import type { ActionBinding } from '@drizztdourden08/brock-input';
import { FUNCTION_ACTIONS } from '@rotp/features';
import type { FunctionMapping } from '@rotp/features';

const toFunctionMapping = (entry: ActionBinding): FunctionMapping[] => {
  const action = FUNCTION_ACTIONS.find((candidate) => candidate === entry.action);
  if (!action) return [];
  return [{ action, binding: entry.binding, icon: entry.icon, sourceVid: entry.sourceVid, sourcePid: entry.sourcePid }];
};

export { toFunctionMapping };
