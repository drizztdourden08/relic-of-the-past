/* @layer shared-game @kind logic */
import { preRolledOfFillWorld } from './pre-rolled-of-fill-world';
import { profileFillWorld } from './profile-fill-world';
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';
import type { PreRolled } from './pre-rolled.type';

const preRolledOfSnapshot = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets = {},
): PreRolled => preRolledOfFillWorld(profileFillWorld(seed, snapshot, deliverable), snapshot);

export { preRolledOfSnapshot };
