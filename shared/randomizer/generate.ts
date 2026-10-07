/* @layer shared-game @kind logic */
/**
 * The generation entry point: it delegates to the ported reference pipeline
 * (world/fill/generate) for a frozen option snapshot.
 */
import type { LocationKey } from './world/location-key';
import { generatePlacement } from './world/fill/generate';
import type { RandomizerOptionsSnapshot } from './world/options.type';
import type { Placement } from './world/fill/placement.type';

/**
 * The snapshot-driven entry: the ported reference pipeline. The optional
 * sets name the npc-scope locations and capacity slots the app proved
 * physically deliverable; with the matching option on, only those shuffle
 * and the rest stay locked vanilla (absent counts as empty, so library
 * callers always get valid seeds).
 */
const generateFromSnapshot = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverableNpcLocations?: ReadonlySet<LocationKey>,
  deliverableCapacityLocations?: ReadonlySet<LocationKey>,
  deliverableWorldLocations?: ReadonlySet<LocationKey>,
): Placement =>
  generatePlacement(seed, snapshot, deliverableNpcLocations, deliverableCapacityLocations,
    deliverableWorldLocations);

export { generateFromSnapshot };
