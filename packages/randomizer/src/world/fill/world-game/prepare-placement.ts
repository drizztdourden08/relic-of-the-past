/* @layer shared-game @kind logic */
import { progressiveSettingFromSnapshot } from '../../progressive/progressive-from-snapshot';
import { assertRollableTickSet } from '../../progressive/tick-set-check';
import { pondDemandsOfSnapshot } from '../pond-demands-of-snapshot';
import { EMPTY_DELIVERABLE } from '../fill.constants';
import type { DeliverableSets, GenerateRequest } from '../fill.type';
import type { RotpPrep } from './rotp-world-game.type';

const fullDeliverable = (sets: DeliverableSets): Required<DeliverableSets> => ({
  npc: sets.npc ?? EMPTY_DELIVERABLE,
  capacity: sets.capacity ?? EMPTY_DELIVERABLE,
  world: sets.world ?? EMPTY_DELIVERABLE,
});

const preparePlacement = (request: GenerateRequest): RotpPrep => {
  const { seed, snapshot, deliverable: sets = {} } = request;
  assertRollableTickSet(progressiveSettingFromSnapshot(snapshot));
  const deliverable = fullDeliverable(sets);
  return { deliverable, pondDemands: pondDemandsOfSnapshot(snapshot, seed, deliverable) };
};

export { preparePlacement };
