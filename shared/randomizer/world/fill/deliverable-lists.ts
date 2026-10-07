/* @layer shared-game @kind logic */
/**
 * The spots the capability probes proved deliverable, as plain lists a profile file, a player
 * file and slot data can carry, and back into the sets generation reads. `pond` is the one
 * set every pond's slots share, which generation names `capacity`.
 */
import type { DeliverableSets } from './fill-options-from-snapshot';
import type { LocationKey } from '../location-key';

interface DeliverableLists {
  npc: LocationKey[];
  pond: LocationKey[];
  world: LocationKey[];
}

const sortedOf = (set: ReadonlySet<LocationKey> | undefined): LocationKey[] => [...(set ?? [])].sort();

const deliverableListsOf = (sets: DeliverableSets): DeliverableLists => ({
  npc: sortedOf(sets.npc),
  pond: sortedOf(sets.capacity),
  world: sortedOf(sets.world),
});

const deliverableSetsOf = (lists: DeliverableLists): Required<DeliverableSets> => ({
  npc: new Set(lists.npc),
  capacity: new Set(lists.pond),
  world: new Set(lists.world),
});

const isKeyList = (value: unknown): value is LocationKey[] =>
  Array.isArray(value) && value.every((key) => typeof key === 'string');

/** Lists read back from a file or a server; anything else in their place is absent. */
const parseDeliverableLists = (raw: unknown): DeliverableLists | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const { npc, pond, world } = raw as Record<string, unknown>;
  if (!isKeyList(npc) || !isKeyList(pond) || !isKeyList(world)) return undefined;
  return { npc, pond, world };
};

export { deliverableListsOf, deliverableSetsOf, parseDeliverableLists };
export type { DeliverableLists };
