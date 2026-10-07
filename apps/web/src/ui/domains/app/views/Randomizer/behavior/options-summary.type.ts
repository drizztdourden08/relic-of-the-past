/* @layer renderer-components @kind types */

/** A count out of the most it could be. */
interface Tally {
  count: number;
  total: number;
}

/** One shuffle scope and whether the run has it on. */
interface ScopeFlag {
  id: string;
  label: string;
  on: boolean;
}

/** The big picture of one frozen option snapshot, as counts. */
interface OptionsSummary {
  /** Options the player could set at creation, and how many are off their default. */
  changed: Tally;
  /** The shuffle scopes the run has on. */
  scopes: Tally;
  /** Each scope, in the order the Options tab lists them. */
  scopeFlags: readonly ScopeFlag[];
  /** Dungeon item families (big keys, small keys, compasses, maps) moved out of their own dungeon. */
  dungeonItems: Tally;
  /** Progressive rungs (sword, shield, mail, glove, bow) ticked into the seed. */
  rungs: Tally;
  /** Story gates set off the story as the game tells it. */
  storyGates: Tally;
  /** Dark-room lights the seed counts, and whether it asks for a light at all. */
  lights: Tally;
  lightRequired: boolean;
  /** Fairy ponds that sell throws for pool items, out of the three. */
  ponds: Tally;
}

export type { OptionsSummary, ScopeFlag, Tally };
