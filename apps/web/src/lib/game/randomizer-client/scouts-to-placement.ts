/* @layer bridge-wasm @kind logic */
/**
 * Adapter: a server's scout answers and slot data, turned into the Placement a local seed
 * with the same options would have produced, so an online session arms through the exact
 * start sequence a local one does (session-start.ts).
 *
 * The fill world is built from the slot's options the way the generator builds it, with no
 * fill run: the scouts say what every location holds. Events and generation-locked rows
 * keep what the fill world pre-places. This slot's own items map through the frozen id
 * table; another player's item, or an id this game does not know, is the foreign item.
 * The stats come from the generator's own function over that world, and the sweep gives the
 * spheres the Spoiler tab groups by.
 */
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

interface ScoutsToPlacementInput {
  scouts: readonly ApNetworkItem[];
  /** This client's slot: an item for any other player is foreign here. */
  slot: number;
  slotData: RotpSlotData;
  idToLocationKey: (id: number) => LocationKey | undefined;
  idToItemKey: (id: number) => ItemKey | undefined;
  /** The seed when the slot data names none (the room's seed name). */
  fallbackSeed?: string;
  /** The locations proven deliverable; the slot data's sets, then the app's probes, when absent. */
  deliverable?: DeliverableSets;
}

const probedDeliverable = (): Required<DeliverableSets> => ({
  npc: probeDeliverableNpcLocations(),
  capacity: probeDeliverablePondLocations(),
  world: probeDeliverableWorldLocations(),
});

/**
 * The caller's sets, else the ones the slot's world was built with, else the app's probes
 * (a room from before slot data carried them).
 */
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
export type { ScoutsToPlacementInput };
