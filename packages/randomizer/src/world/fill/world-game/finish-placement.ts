/* @layer shared-game @kind logic */
import { placementStatsOf } from '../placement-stats';
import { verifiedLocationsOf } from '../verified-locations-of';
import type { Placement } from '../placement.type';
import type { FinishedAttempt } from './rotp-world-game.type';

const finishPlacement = ({ build, sweep, prep, request, attempts }: FinishedAttempt): Placement => {
  const { fillWorld, shopPrices, shufflePrizes, deliverable } = build;
  return {
    seed: request.seed,
    medallions: fillWorld.world.options.medallions,
    locations: verifiedLocationsOf(fillWorld, sweep),
    shopPrices,
    pondDemands: prep.pondDemands,
    spheres: sweep.spheres,
    stats: placementStatsOf({
      fillWorld, attempts, shufflePrizes, deliverable, sphereCount: sweep.spheres.length,
    }),
  };
};

export { finishPlacement };
