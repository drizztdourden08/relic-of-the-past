/* @layer renderer-components @kind logic */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import { SNES_ACTIONS } from './action-defs.constants';
import type { TextOf } from './action-defs.type';
import { cheatActionDefs } from './cheat-action-defs';
import { shortcutActionDefs } from './shortcut-action-defs';

const allActionDefs = (text: TextOf): readonly ActionDef[] => [...SNES_ACTIONS, ...shortcutActionDefs(text), ...cheatActionDefs(text)];

export { allActionDefs };
