/* @layer bridge-wasm @kind logic */
import { FOREIGN_ITEM_KEY } from '@shared/randomizer/archipelago/foreign-item';
import { buildFillWorld } from '@shared/randomizer/world/fill/fill-world';
import { fillOptionsFromSnapshot, shufflePrizesFromSnapshot } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import { pondDemandsOfSnapshot } from '@shared/randomizer/world/fill/pond-demands-of-snapshot';
import { placementStatsOf } from '@shared/randomizer/world/fill/placement-stats';
import { sweepPlacementSpheres } from '@shared/randomizer/world/fill/verify-placement';
import {
  probeDeliverableNpcLocations, probeDeliverablePondLocations, probeDeliverableWorldLocations,
} from './npc-capability';
import {
  medallionsOfSlot, preRolledDeliverable, preRolledPondDemands, preRolledShopPrices, snapshotOfSlot,
} from './slot-data-values';
import type { DeliverableSets } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';
import type { ApNetworkItem } from './ap-protocol.type';
import type { ScoutsToPlacementInput } from './scouts-to-placement.type';

const probedDeliverable = (): Required<DeliverableSets> => ({
  npc: probeDeliverableNpcLocations(),
  capacity: probeDeliverablePondLocations(),
  world: probeDeliverableWorldLocations(),
});

const withDefaults = (
  deliverable: DeliverableSets | undefined, slotData: RotpSlotData,
): Required<DeliverableSets> => {
  const probed = preRolledDeliverable(slotData) ?? probedDeliverable();
  return {
    npc: deliverable?.npc ?? probed.npc,
    capacity: deliverable?.capacity ?? probed.capacity,
    world: deliverable?.world ?? probed.world,
  };
};

const itemOfScout = (input: ScoutsToPlacementInput, scout: ApNetworkItem): ItemKey =>
  (scout.player === input.slot ? input.idToItemKey(scout.item) : undefined) ?? FOREIGN_ITEM_KEY;

const scoutsToPlacement = (input: ScoutsToPlacementInput): Placement => {
  const { scouts, slotData, idToLocationKey, fallbackSeed = '' } = input;
  const snapshot = snapshotOfSlot(slotData);
  const seed = slotData.seed ?? fallbackSeed;
  const deliverable = withDefaults(input.deliverable, slotData);
  const pondDemands = preRolledPondDemands(slotData) ?? pondDemandsOfSnapshot(snapshot, seed, deliverable);
  const shopPrices = preRolledShopPrices(slotData) ?? {};
  const fillWorld = buildFillWorld({
    ...fillOptionsFromSnapshot(snapshot, deliverable, {}, seed),
    medallions: medallionsOfSlot(slotData),
    shopPrices,
    pondDemands,
  });
  const { world } = fillWorld;
  for (const scout of scouts) {
    const location = idToLocationKey(scout.location);
    if (location !== undefined && world.locationsByKey.has(location)) {
      world.placedItems.set(location, itemOfScout(input, scout));
    }
  }
  const locations: Partial<Record<LocationKey, ItemKey>> = {};
  for (const key of world.locationsByKey.keys()) {
    const item = world.placedItems.get(key);
    if (item !== undefined) locations[key] = item;
  }
  const sweep = sweepPlacementSpheres(world);
  return {
    seed,
    medallions: world.options.medallions,
    locations: locations as Record<LocationKey, ItemKey>,
    shopPrices,
    pondDemands,
    spheres: sweep.spheres,
    stats: placementStatsOf({
      fillWorld, attempts: 1, shufflePrizes: shufflePrizesFromSnapshot(snapshot), deliverable,
      sphereCount: sweep.spheres.length,
    }),
  };
};

export { scoutsToPlacement };
export type { ScoutsToPlacementInput } from './scouts-to-placement.type';
