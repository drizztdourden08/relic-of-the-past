/* @layer shared-game @kind logic */
import { buildFillWorld } from '../world/fill/fill-world';
import type { World } from '../world/world.type';
import type { ActToken } from '../world/events/event-gate.type';
import type { LocationKey } from '../world/location-key';
import type { Placement } from '../world/fill/placement.type';

const worldFromPlacement = (
  placement: Placement,
  darkRoomsNeedLight: boolean,
  actTokens: ReadonlySet<ActToken> | undefined,
): World => {
  const { stats } = placement;
  const darkRooms = darkRoomsNeedLight ? stats.darkRooms
    : { ...stats.darkRooms, requireLight: false };
  const { world } = buildFillWorld({
    keyDropShuffle: stats.keyDropShuffle,
    includeNpcChecks: stats.includeNpcChecks,
    includeWorldItems: stats.includeWorldItems,
    capacity: stats.capacity,
    capacityProgressive: stats.capacityProgressive,
    capacityBonus: stats.capacityBonus,
    shops: stats.shops,
    shopPrices: placement.shopPrices,
    ponds: stats.ponds,
    pondSlotsFollowMode: stats.pondSlotsFollowMode,
    pondDemands: placement.pondDemands,
    darkRooms,
    storyGates: stats.storyGates,
    ...(actTokens === undefined ? {} : { actTokens }),
    progressiveTiers: stats.progressiveTiers,
    progressiveModes: stats.progressiveModes,
    retroBow: stats.retroBow,
    itemPower: stats.itemPower,
    dungeonItems: stats.dungeonItems,
    accessibility: stats.accessibility,
    medallions: placement.medallions,
  });
  for (const [location, item] of Object.entries(placement.locations)) {
    world.placedItems.set(location as LocationKey, item);
  }
  return world;
};

export { worldFromPlacement };
