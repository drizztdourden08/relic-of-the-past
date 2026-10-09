/* @layer shared-game @kind logic */
import {
  KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS,
} from '../world/scope-tables';
import { ITEM } from '../world/item-ids';
import { checkIdOfLocation } from '../world/location-record';
import { DUNGEON_FIELD_OF_GENERIC_ITEM } from './normal-placement.constants';
import type { CheckId, ItemId, RegionId } from '@rotp/game-data';
import type { ItemKey } from '../world/item-ids';
import type { LocationKey } from '../world/location-key';
import type { WorldDungeon } from '../world/region.type';
import type { World } from '../world/world.type';

const dungeonOfRegion = (world: World, region: RegionId): WorldDungeon | undefined =>
  [...world.dungeons.values()].find((dungeon) => dungeon.regions.includes(region));

const directContentOf = (location: LocationKey): ItemKey | undefined =>
  KEY_DROP_LOCATIONS.get(location)
    ?? NPC_SCOPE_LOCATIONS.get(location) ?? WORLD_ITEM_SCOPE_LOCATIONS.get(location)
    ?? VANILLA_PRIZES.get(location);

const originalContentOf = (
  world: World, recorded: ReadonlyMap<CheckId, ItemId>, location: LocationKey, region: RegionId,
): ItemKey | undefined => {
  const direct = directContentOf(location);
  if (direct !== undefined) return direct;

  const checkId = checkIdOfLocation(location);
  const held = checkId === undefined ? undefined : recorded.get(checkId);
  if (held === undefined) return undefined;
  if (held === ITEM.heartContainer) return ITEM.bossHeartContainer;

  const field = DUNGEON_FIELD_OF_GENERIC_ITEM.get(held);
  if (field === undefined) return held;
  return dungeonOfRegion(world, region)?.[field] ?? undefined;
};

export { originalContentOf };
