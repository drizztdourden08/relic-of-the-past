/* @layer shared-game @kind logic */
import { buildRolledFillWorld } from '../build-rolled-fill-world';
import { fillEligibleLocations } from '../fill-world';
import { shufflePrizesFromSnapshot } from '../fill-options-from-snapshot';
import type { AttemptContext, RotpBuild } from './rotp-world-game.type';

const buildPlacementAttempt = ({ request, prep, rng }: AttemptContext): RotpBuild => {
  const { seed, snapshot } = request;
  const { deliverable, pondDemands } = prep;
  const { shopPrices, fillWorld } = buildRolledFillWorld({ seed, rng, snapshot, deliverable, pondDemands });
  const { world, pool, accessibility } = fillWorld;
  return {
    world,
    progression: [...pool.progression],
    rest: [...pool.useful, ...pool.filler],
    eligible: () => fillEligibleLocations(fillWorld),
    relaxWhenBeatable: accessibility === 'minimal',
    fillWorld,
    shopPrices,
    shufflePrizes: shufflePrizesFromSnapshot(snapshot),
    deliverable,
  };
};

export { buildPlacementAttempt };
