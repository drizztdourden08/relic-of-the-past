/* @layer shared-game @kind types */
/**
 * The randomizer's output contract: a Placement is the full, serializable
 * result of one seed: which item sits at which check, plus the spoiler spheres.
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

interface Placement {
  version: 1;
  seed: string;
  options: RandomizerOptions;
  /** CheckId -> ItemId. */
  assignments: Record<string, string>;
  /**
   * Standard location name -> standard item name. Filled by a later
   * integration step, and the generator leaves it {} for now.
   */
  nameView: Record<string, string>;
  spoiler: SpoilerSphere[];
}

const DEFAULT_OPTIONS: RandomizerOptions = {
  mode: 'standard',
  accessibility: 'items',
  randomizedKinds: ['chest', 'keyDrop'],
};

export { DEFAULT_OPTIONS };
export type { Placement, RandomizedKind, RandomizerOptions, SpoilerSphere, SpoilerSphereEntry };
