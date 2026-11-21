/* @layer renderer-components @kind logic */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import type { TextOf } from './action-defs.type';
import { cheatActionDefs } from './cheat-action-defs';
import { shortcutActionDefs } from './shortcut-action-defs';
import { snesActionDefs } from './snes-action-defs';

const allActionDefs = (text: TextOf): readonly ActionDef[] => [...snesActionDefs(text), ...shortcutActionDefs(text), ...cheatActionDefs(text)];

export { allActionDefs };
