/* @layer shared-input @kind logic */
import type { TouchBindings } from '@rotp/features';
import type { InputBinding } from '@rotp/game-data';
import type { TouchBindTarget } from './touch-bind-target.type';
import { withoutKey } from './without-key';

const putOrDrop = (
  table: Readonly<Record<string, InputBinding>>,
  id: string,
  binding: InputBinding | null,
): Record<string, InputBinding> => (binding ? { ...table, [id]: binding } : withoutKey(table, id));

const setTouchBinding = (b: TouchBindings, target: TouchBindTarget, binding: InputBinding | null): TouchBindings => {
  if (target.kind === 'classic') return { ...b, classic: putOrDrop(b.classic, target.id, binding) };
  if (target.kind === 'verb') return { ...b, verbs: putOrDrop(b.verbs, target.id, binding) };
  const slots = putOrDrop(b.slots as Readonly<Record<string, InputBinding>>, String(target.index), binding);
  return { ...b, slots: slots as Readonly<Record<number, InputBinding>> };
};

export { setTouchBinding };
