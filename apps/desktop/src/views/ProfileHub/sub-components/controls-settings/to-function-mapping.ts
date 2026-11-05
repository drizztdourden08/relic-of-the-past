/* @layer renderer-components @kind logic */
import type { ActionBinding } from '@drizztdourden08/brock-input';
import { CHEAT_ACTIONS, SHORTCUT_ACTIONS } from '@rotp/features';
import type { FunctionAction, FunctionMapping } from '@rotp/features';

const FUNCTION_ACTION_IDS: readonly FunctionAction[] = [...SHORTCUT_ACTIONS, ...CHEAT_ACTIONS];

const toFunctionMapping = (entry: ActionBinding): FunctionMapping[] => {
  const action = FUNCTION_ACTION_IDS.find((candidate) => candidate === entry.action);
  if (!action) return [];
  return [{ action, binding: entry.binding, icon: entry.icon, sourceVid: entry.sourceVid, sourcePid: entry.sourcePid }];
};

export { toFunctionMapping };
