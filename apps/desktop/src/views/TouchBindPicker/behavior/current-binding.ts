/* @layer renderer-app @kind logic */
import type { ListenTarget } from '@drizztdourden08/brock-input/renderer';
import type { TouchBindings } from '@rotp/features';
import type { InputBinding } from '@rotp/game-data';
import { toBindTarget } from './to-bind-target';

const currentBinding = (bindings: TouchBindings, target: ListenTarget): InputBinding | null => {
  const bind = toBindTarget(target);
  if (bind.kind === 'classic') return bindings.classic[bind.id] ?? null;
  if (bind.kind === 'verb') return bindings.verbs[bind.id] ?? null;
  return bindings.slots[bind.index] ?? null;
};

export { currentBinding };
