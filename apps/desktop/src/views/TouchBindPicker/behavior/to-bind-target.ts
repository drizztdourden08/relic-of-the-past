/* @layer renderer-app @kind logic */
import type { ListenTarget } from '@drizztdourden08/brock-input/renderer';
import type { TouchBindTarget } from '@rotp/input-mapping';

const toBindTarget = (target: ListenTarget): TouchBindTarget => {
  if (target.type === 'action') return { kind: 'classic', id: target.id };
  if (target.type === 'verb') return { kind: 'verb', id: target.id };
  return { kind: 'slot', index: target.slot.index };
};

export { toBindTarget };
