/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { createRng } from '../../rng';
import { buildFillWorld } from './fill-world';
import { fillOptionsFromSnapshot } from './fill-options-from-snapshot';
import { pondItemPoolStreamOf } from '../pond/pond-demand-seed';
import type { ItemKey } from '../item-ids';
import type { DeliverableSets } from './fill.type';
import type { RandomizerOptionsSnapshot } from '../options.type';

const pondCandidatePoolOf = (
  snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets, seed: string,
): readonly ItemKey[] => {
  const rng = createRng(pondItemPoolStreamOf(seed));
  return buildFillWorld(fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => itemAt(choices, rng.int(choices.length)),
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => itemAt(choices, rng.int(choices.length)),
  }, seed)).pool.pool;
};

export { pondCandidatePoolOf };
