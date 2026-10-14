/* @layer shared-game @kind logic */
import { progressiveSettingFromSnapshot } from '../progressive/progressive-from-snapshot';
import { assertRollableTickSet } from '../progressive/tick-set-check';
import { pondDemandsOfSnapshot } from './pond-demands-of-snapshot';
import { attemptPlacement } from './attempt-placement';
import { FillError } from './fill-error';
import { EMPTY_DELIVERABLE, MAX_PLACEMENT_ATTEMPTS } from './fill.constants';
import type { DeliverableSets, GenerateRequest } from './fill.type';
import type { Placement } from './placement.type';

const fullDeliverable = (sets: DeliverableSets): Required<DeliverableSets> => ({
  npc: sets.npc ?? EMPTY_DELIVERABLE,
  capacity: sets.capacity ?? EMPTY_DELIVERABLE,
  world: sets.world ?? EMPTY_DELIVERABLE,
});

const generatePlacement = (request: GenerateRequest): Placement => {
  const { seed, snapshot, deliverable: sets = {} } = request;
  assertRollableTickSet(progressiveSettingFromSnapshot(snapshot));
  const deliverable = fullDeliverable(sets);
  const pondDemands = pondDemandsOfSnapshot(snapshot, seed, deliverable);
  let lastMessage = '';
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
    const attemptSeed = attempt === 0 ? seed : `${seed}#retry${attempt}`;
    try {
      return attemptPlacement({ seed, attemptSeed, snapshot, attempts: attempt + 1 }, deliverable, pondDemands);
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
