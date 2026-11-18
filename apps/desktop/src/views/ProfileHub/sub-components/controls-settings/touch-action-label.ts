/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ListenTarget } from '@drizztdourden08/brock-input/renderer';
import { coreVerbDefs } from './core-verbs.constants';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { allActionDefs } from './action-defs';

const touchActionLabel = (target: ListenTarget, t: I18n['t'], text: (text: Text) => string): string => {
  if (target.type === 'slot') return target.slot.label;
  if (target.type === 'verb') return coreVerbDefs(t).find((verb) => verb.id === target.id)?.label ?? target.id;
  return allActionDefs(text).find((action) => action.id === target.id)?.label ?? target.id;
};

export { touchActionLabel };
