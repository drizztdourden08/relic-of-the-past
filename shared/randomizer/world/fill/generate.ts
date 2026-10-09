/* @layer shared-game @kind logic */
import { progressiveSettingFromSnapshot } from '../progressive/progressive-from-snapshot';
import { assertRollableTickSet } from '../progressive/tick-set-check';
import { pondDemandsOfSnapshot } from './pond-demands-of-snapshot';
import { attemptPlacement } from './attempt-placement';
import { FillError } from './fill-error';
import { EMPTY_DELIVERABLE, MAX_PLACEMENT_ATTEMPTS } from './fill.constants';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type { LocationKey } from '../location-key';
import type { DeliverableSets } from './fill.type';
import type { Placement } from './placement.type';

const generatePlacement = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverableNpcLocations?: ReadonlySet<LocationKey>,
  deliverableCapacityLocations?: ReadonlySet<LocationKey>,
  deliverableWorldLocations?: ReadonlySet<LocationKey>,
): Placement => {
  assertRollableTickSet(progressiveSettingFromSnapshot(snapshot));
  const deliverable: Required<DeliverableSets> = {
    npc: deliverableNpcLocations ?? EMPTY_DELIVERABLE,
    capacity: deliverableCapacityLocations ?? EMPTY_DELIVERABLE,
    world: deliverableWorldLocations ?? EMPTY_DELIVERABLE,
  };
  const pondDemands = pondDemandsOfSnapshot(snapshot, seed, deliverable);
  let lastMessage = '';
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
    const attemptSeed = attempt === 0 ? seed : `${seed}#retry${attempt}`;
    try {
      return attemptPlacement(seed, attemptSeed, snapshot, attempt + 1, deliverable, pondDemands);
    } catch (error) {
      if (!(error instanceof FillError)) throw error;
      lastMessage = error.message;
    }
  }
  throw new Error(
    `generation failed for seed "${seed}" after ${MAX_PLACEMENT_ATTEMPTS} attempts, last: ${lastMessage}`,
  );
};

export { generatePlacement };
