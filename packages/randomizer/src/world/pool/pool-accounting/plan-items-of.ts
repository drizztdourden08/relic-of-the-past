/* @layer shared-game @kind logic */
import { capacityPlansOf } from '../../capacity/family-plan';
import type { ItemKey } from '../../item-ids.data';
import type { FillWorld } from '../../fill/fill-world.type';

const planItemsOf = (fillWorld: FillWorld): ReadonlySet<ItemKey> =>
  new Set(Object.values(capacityPlansOf(fillWorld.capacity, fillWorld.capacityProgressive)).flatMap((plan) => plan.items));

export { planItemsOf };
