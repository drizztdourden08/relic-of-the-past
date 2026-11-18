/* @layer renderer-components @kind logic */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import { CHEAT_ACTIONS } from '@rotp/features';
import type { TextOf } from './action-defs.type';
import { functionActionDef } from './function-action-def';

const cheatActionDefs = (text: TextOf): readonly ActionDef[] => CHEAT_ACTIONS.map(functionActionDef(text));

export { cheatActionDefs };
