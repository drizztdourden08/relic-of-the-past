/* @layer shared-game @kind logic */
/**
 * What each location holds in the unmodified game, in the pool's own terms.
 *
 * Five recorded items are generic because the dataset names the object, not the copy: Small
 * Key, Big Key, Map, Compass and Heart Container. The pool names each one for the dungeon it
 * belongs to, so those five are resolved from the dungeon the location sits in, which is read
 * off the world graph and never spelled here.
 */
import { find } from '../game/data';
import {
  KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS,
} from './world/scope-tables';
import { ITEM } from './world/item-ids.data';
import { EVENT_ITEMS } from './world/pool/event-items.data';
import { checkIdOfLocation } from './world/location-record';
import type { CheckId, ItemId, RegionId } from '../game/data/types/ids';
import type { ItemKey } from './world/item-ids.data';
import type { LocationKey } from './world/location-key';
import type { WorldDungeon } from './world/region.type';
import type { World } from './world/world.type';

/** The generic recorded items, and which field of a dungeon names the real copy. */
const BY_DUNGEON_FIELD: ReadonlyMap<ItemId, 'smallKey' | 'bigKey' | 'map' | 'compass'> = new Map([
  [ITEM.smallKey, 'smallKey' as const],
  [ITEM.bigKey, 'bigKey' as const],
  [ITEM.map, 'map' as const],
  [ITEM.compass, 'compass' as const],
]);

const dungeonOfRegion = (world: World, region: RegionId): WorldDungeon | undefined =>
  [...world.dungeons.values()].find((dungeon) => dungeon.regions.includes(region));

/**
 * What this location originally holds, or undefined when nothing records it. Order matters:
 * the scope and key-drop tables name the copy directly, so they win over the check record's
 * generic reading.
 */
const originalContentOf = (
  world: World, recorded: ReadonlyMap<CheckId, ItemId>, location: LocationKey, region: RegionId,
): ItemKey | undefined => {
  const direct = EVENT_ITEMS.get(location) ?? KEY_DROP_LOCATIONS.get(location)
    ?? NPC_SCOPE_LOCATIONS.get(location) ?? WORLD_ITEM_SCOPE_LOCATIONS.get(location)
    ?? VANILLA_PRIZES.get(location);
  if (direct !== undefined) return direct;

  const checkId = checkIdOfLocation(location);
  const held = checkId === undefined ? undefined : recorded.get(checkId);
  if (held === undefined) return undefined;
  if (held === ITEM.heartContainer) return ITEM.bossHeartContainer;

  const field = BY_DUNGEON_FIELD.get(held);
  if (field === undefined) return held;
  return dungeonOfRegion(world, region)?.[field] ?? undefined;
};

/** Every check mapped to the item it originally holds. */
const recordedContents = (): ReadonlyMap<CheckId, ItemId> => {
  const contents = new Map<CheckId, ItemId>();
  for (const check of find('check', () => true)) {
    const first = check.vanillaItemIds[0];
    if (first !== undefined) contents.set(check.id, first);
  }
  return contents;
};

export { originalContentOf, recordedContents };
