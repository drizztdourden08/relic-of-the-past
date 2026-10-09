/* @layer renderer-components @kind logic */
import { isTranslated } from './is-translated';
import type { TextGroup } from '@shared/game/language';
import type { GroupTally } from './text-groups.type';

const tallyOf = (
  group: TextGroup,
  values: Record<string, string>,
  active: boolean,
): GroupTally => ({
  translated: group.slots.reduce((done, slot) => (isTranslated(slot, values) ? done + 1 : done), 0),
  total: group.slots.length,
  known: active || group.slots.some((slot) => values[slot.key] !== undefined),
});

export { tallyOf };
