/* @layer renderer-components @kind logic */
import type { ListenTarget } from '@drizztdourden08/brock-input/renderer';
import { CORE_VERB_DEFS } from './core-verbs.constants';
import { ACTION_DEFS } from './touch-action-label.constants';

const touchActionLabel = (target: ListenTarget): string => {
  if (target.type === 'slot') return target.slot.label;
  if (target.type === 'verb') return CORE_VERB_DEFS.find((verb) => verb.id === target.id)?.label ?? target.id;
  return ACTION_DEFS.find((action) => action.id === target.id)?.label ?? target.id;
};

export { touchActionLabel };
