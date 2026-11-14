/* @layer renderer-components @kind constants */
import { CHEAT_ACTION_DEFS, SHORTCUT_ACTION_DEFS, SNES_ACTIONS } from './action-defs.constants';

const ACTION_DEFS = [...SNES_ACTIONS, ...SHORTCUT_ACTION_DEFS, ...CHEAT_ACTION_DEFS];

export { ACTION_DEFS };
