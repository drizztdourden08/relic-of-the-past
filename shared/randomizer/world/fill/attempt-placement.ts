/* @layer shared-game @kind logic */
import { createRng } from '../../rng';
import { placementStatsOf } from './placement-stats';
import { buildFillWorld, fillEligibleLocations } from './fill-world';
import { fillOptionsFromSnapshot, shufflePrizesFromSnapshot } from './fill-options-from-snapshot';
import { rollPrices } from './roll-placement-prices';
import { prefillDungeonItems } from './dungeon-fill';
import { fillRestrictive } from './fill-restrictive';
import { placePrizes } from './place-prizes';
import { sweepPlacementSpheres } from './verify-placement';
import { verifiedLocationsOf } from './verified-locations-of';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { DeliverableSets } from './fill.type';
import type { Placement } from './placement.type';

const attemptPlacement = (
  seed: string, attemptSeed: string, snapshot: RandomizerOptionsSnapshot, attempts: number,
  deliverable: Required<DeliverableSets>, pondDemands: PondDemandView,
): Placement => {
  const rng = createRng(attemptSeed);
  const fillOptions = fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => choices[rng.int(choices.length)],
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => choices[rng.int(choices.length)],
  }, seed);
  const shopPrices = rollPrices({ values: snapshot.values, options: fillOptions, rng });
  const fillWorld = buildFillWorld({ ...fillOptions, shopPrices, pondDemands });
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
  openLocations.forEach((location, index) => world.placedItems.set(location, rest[index]));
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
