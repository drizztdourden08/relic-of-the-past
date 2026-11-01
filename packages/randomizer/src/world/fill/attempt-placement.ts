/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { placementStatsOf } from './placement-stats';
import { buildRolledFillWorld } from './build-rolled-fill-world';
import { fillEligibleLocations } from './fill-world';
import { shufflePrizesFromSnapshot } from './fill-options-from-snapshot';
import { prefillDungeonItems } from './dungeon-fill';
import { fillRestrictive } from './fill-restrictive';
import { placePrizes } from './place-prizes';
import { sweepPlacementSpheres } from './verify-placement';
import { verifiedLocationsOf } from './verified-locations-of';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { DeliverableSets, PlacementAttempt } from './fill.type';
import type { Placement } from './placement.type';

const attemptPlacement = (
  attempt: PlacementAttempt, deliverable: Required<DeliverableSets>, pondDemands: PondDemandView,
): Placement => {
  const { seed, attemptSeed, snapshot, attempts } = attempt;
  const { rng, shopPrices, fillWorld } = buildRolledFillWorld({
    seed, rngSeed: attemptSeed, snapshot, deliverable, pondDemands,
  });
  const { world, pool, accessibility } = fillWorld;
  const relaxWhenBeatable = accessibility === 'minimal';
  const shufflePrizes = shufflePrizesFromSnapshot(snapshot);
  placePrizes(fillWorld, shufflePrizes, rng);
  prefillDungeonItems(fillWorld, rng);
  const openLocations = rng.shuffle(fillEligibleLocations(fillWorld));
  const progression = rng.shuffle(pool.progression);
  fillRestrictive({
    world, items: progression, locations: openLocations, assumedItems: [], relaxWhenBeatable,
  });
  const rest = rng.shuffle([...pool.useful, ...pool.filler]);
  if (openLocations.length !== rest.length) {
    throw new Error(`junk fill imbalance: ${openLocations.length} open vs ${rest.length} items`);
  }
  openLocations.forEach((location, index) => world.placedItems.set(location, itemAt(rest, index)));
  const sweep = sweepPlacementSpheres(world);
  return {
    seed,
    medallions: world.options.medallions,
    locations: verifiedLocationsOf(fillWorld, sweep),
    shopPrices,
    pondDemands,
    spheres: sweep.spheres,
    stats: placementStatsOf({
      fillWorld, attempts, shufflePrizes, deliverable, sphereCount: sweep.spheres.length,
    }),
  };
};

export { attemptPlacement };
