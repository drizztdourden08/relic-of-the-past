/* @layer shared-game @kind logic */
import type { DeliverableLists, DeliverableSets } from '../fill.type';

const deliverableSetsOf = (lists: DeliverableLists): Required<DeliverableSets> => ({
  npc: new Set(lists.npc),
  capacity: new Set(lists.pond),
  world: new Set(lists.world),
});

export { deliverableSetsOf };
