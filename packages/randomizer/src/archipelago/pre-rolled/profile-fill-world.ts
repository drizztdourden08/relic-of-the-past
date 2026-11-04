/* @layer shared-game @kind logic */
import { createRng } from '../../rng';
import { buildRolledFillWorld } from '../../world/fill/build-rolled-fill-world';
import { pondDemandsOfSnapshot } from '../../world/fill/pond-demands-of-snapshot';
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { FillWorld } from '../../world/fill/fill-world.type';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';

const profileFillWorld = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets = {},
): FillWorld => {
  const pondDemands = pondDemandsOfSnapshot(snapshot, seed, deliverable);
  return buildRolledFillWorld({ seed, rng: createRng(seed), snapshot, deliverable, pondDemands }).fillWorld;
};

export { profileFillWorld };
