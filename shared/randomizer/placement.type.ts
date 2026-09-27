/* @layer shared-game @kind types */
/**
 * The v1 output contract the first generator wrote: a LegacyPlacement is the
 * full, serializable result of one seed, which item sits at which check, plus
 * the spoiler spheres. A profile saved under it is lifted into the engine's
 * Placement on read (legacy-placement.ts).
 */

/** Check kinds the randomizer is allowed to reassign. */
type RandomizedKind = 'chest' | 'keyDrop';

interface RandomizerOptions {
  /** World state, fixed to standard (the vanilla escape sequence intro). */
  mode: 'standard';
  /** Reachability guarantee: 'items' means every item must be collectable. */
  accessibility: 'items';
  randomizedKinds: readonly RandomizedKind[];
}

interface SpoilerSphereEntry {
  checkId: string;
  itemId: string;
}

interface SpoilerSphere {
  index: number;
  entries: SpoilerSphereEntry[];
}

interface LegacyPlacement {
  version: 1;
  seed: string;
  options: RandomizerOptions;
  /** CheckId -> ItemId. */
  assignments: Record<string, string>;
  spoiler: SpoilerSphere[];
}

const DEFAULT_OPTIONS: RandomizerOptions = {
  mode: 'standard',
  accessibility: 'items',
  randomizedKinds: ['chest', 'keyDrop'],
};

export { DEFAULT_OPTIONS };
export type { LegacyPlacement, RandomizedKind, RandomizerOptions, SpoilerSphere, SpoilerSphereEntry };
