/* @layer renderer-components @kind logic */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import { FUNCTION_ACTION_LABELS } from '@rotp/features';
import type { FunctionAction } from '@rotp/features';
import type { TextOf } from './action-defs.type';

const functionActionDef = (text: TextOf) => (action: FunctionAction): ActionDef => ({ id: action, label: text(FUNCTION_ACTION_LABELS[action]) });

export { functionActionDef };
