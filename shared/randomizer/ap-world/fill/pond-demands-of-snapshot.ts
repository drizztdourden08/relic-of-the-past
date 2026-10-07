/* @layer shared-game @kind logic */
/**
 * A snapshot and a seed → the demands that seed's ponds ask for. THE one
 * entry point: the generator calls it to record them on the placement, and the
 * options panel calls it to preview them, so a row the panel draws is the row
 * the seed carries.
 *
 * The candidate pool an item demand names from is this snapshot's own pool,
 * built on a stream of the seed (pond-demand-seed.ts) instead of the attempt's,
 * so a retry cannot move which names were on offer. It is built only when a
 * pond has the item row ticked.
 *
 * The deliverable sets are the capability probes' answers, the same ones the
 * fill is given, because the scope they open decides what the pool carries.
 */
import { createRng } from '../../rng';
import { buildFillWorld } from './fill-world';
import { fillFlagsOf, fillOptionsFromSnapshot } from './fill-options-from-snapshot';
import { pondDemandsOfSeed, pondItemPoolStreamOf } from '../pond/pond-demand-seed';
import type { DeliverableSets } from './fill-options-from-snapshot';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { RandomizerOptionsSnapshot } from '../options.type';

const NO_DELIVERABLE: DeliverableSets = {};

/** The pool a demand may name from: this snapshot's own, on the seed's own stream. */
const pondCandidatePoolOf = (
  snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets, seed: string,
): readonly string[] => {
  const rng = createRng(pondItemPoolStreamOf(seed));
  return buildFillWorld(fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => choices[rng.int(choices.length)],
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => choices[rng.int(choices.length)],
  }, seed)).pool.pool;
};

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

export { pondCandidatePoolOf, pondDemandsOfSnapshot };
