/* @layer shared-game @kind logic */
import { fillFlagsOf } from './fill-options-from-snapshot';
import { pondDemandsOfSeed } from '../pond/pond-demand-seed';
import { pondCandidatePoolOf } from './pond-candidate-pool-of';
import { NO_DELIVERABLE } from './fill.constants';
import type { DeliverableSets } from './fill.type';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { RandomizerOptionsSnapshot } from '../options.type';

const pondDemandsOfSnapshot = (
  snapshot: RandomizerOptionsSnapshot, seed: string, deliverable: DeliverableSets = NO_DELIVERABLE,
): PondDemandView => {
  const flags = fillFlagsOf(snapshot, seed);
  return pondDemandsOfSeed({
    seed,
    ponds: flags.ponds,
    capacity: flags.capacity,
    itemPool: () => pondCandidatePoolOf(snapshot, deliverable, seed),
  });
};

export { pondDemandsOfSnapshot };
