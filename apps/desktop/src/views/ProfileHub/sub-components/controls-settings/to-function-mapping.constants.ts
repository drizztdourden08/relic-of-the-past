/* @layer renderer-components @kind constants */
import { CHEAT_ACTIONS, SHORTCUT_ACTIONS } from '@rotp/features';
import type { FunctionAction } from '@rotp/features';

const FUNCTION_ACTION_IDS: readonly FunctionAction[] = [...SHORTCUT_ACTIONS, ...CHEAT_ACTIONS];

export { FUNCTION_ACTION_IDS };
