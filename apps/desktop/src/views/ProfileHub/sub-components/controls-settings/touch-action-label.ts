/* @layer renderer-components @kind logic */
import type { ListenTarget } from '@drizztdourden08/brock-input/renderer';
import { CHEAT_ACTION_DEFS, SHORTCUT_ACTION_DEFS, SNES_ACTIONS } from './action-defs.constants';
import { CORE_VERB_DEFS } from './core-verbs.constants';

const ACTION_DEFS = [...SNES_ACTIONS, ...SHORTCUT_ACTION_DEFS, ...CHEAT_ACTION_DEFS];

const touchActionLabel = (target: ListenTarget): string => {
  if (target.type === 'slot') return target.slot.label;
  if (target.type === 'verb') return CORE_VERB_DEFS.find((verb) => verb.id === target.id)?.label ?? target.id;
  return ACTION_DEFS.find((action) => action.id === target.id)?.label ?? target.id;
};

export { touchActionLabel };
