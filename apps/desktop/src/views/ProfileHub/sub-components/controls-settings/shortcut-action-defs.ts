/* @layer renderer-components @kind logic */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import { SHORTCUT_ACTIONS } from '@rotp/features';
import type { TextOf } from './action-defs.type';
import { functionActionDef } from './function-action-def';

const shortcutActionDefs = (text: TextOf): readonly ActionDef[] => SHORTCUT_ACTIONS.map(functionActionDef(text));

export { shortcutActionDefs };
