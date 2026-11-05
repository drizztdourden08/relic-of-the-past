/* @layer renderer-components @kind logic */
import type { ActionBinding } from '@drizztdourden08/brock-input';
import type { FunctionMapping } from '@rotp/features';
import { FUNCTION_ACTION_IDS } from './to-function-mapping.constants';

const toFunctionMapping = (entry: ActionBinding): FunctionMapping[] => {
  const action = FUNCTION_ACTION_IDS.find((candidate) => candidate === entry.action);
  if (!action) return [];
  return [{ action, binding: entry.binding, icon: entry.icon, sourceVid: entry.sourceVid, sourcePid: entry.sourcePid }];
};

export { toFunctionMapping };
