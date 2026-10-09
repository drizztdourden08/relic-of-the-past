/* @layer shared-game @kind logic */
import type { LocationKey } from '../../location-key';
import type { DeliverableLists, DeliverableSets } from '../fill.type';

const sortedOf = (set: ReadonlySet<LocationKey> | undefined): LocationKey[] => [...(set ?? [])].sort();

const deliverableListsOf = (sets: DeliverableSets): DeliverableLists => ({
  npc: sortedOf(sets.npc),
  pond: sortedOf(sets.capacity),
  world: sortedOf(sets.world),
});

export { deliverableListsOf };
