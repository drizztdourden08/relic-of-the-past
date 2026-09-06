/* @layer shared-game @kind types */
/**
 * The assembled baseline item pool. `pool` is the 153-item shuffled-anywhere
 * multiset (ItemPool.py total_items_to_place); dungeonItems are the
 * dungeon-restricted set that never enters the global pool (keys, big keys,
 * maps, compasses per dungeon — the reference pre-fills these inside their
 * own dungeon under the baseline shuffle options); prizes fill the ten prize
 * locations; eventItems sit locked on the event locations. startInventory is
 * the reference's precollected list (empty for the baseline).
 */

interface ApItemPool {
  pool: readonly string[];
  /** Partition of `pool` per Items.py item_table classification. */
  progression: readonly string[];
  useful: readonly string[];
  filler: readonly string[];
  /**
   * Standard-mode assurance (ItemPool.py 294-318): the weapon removed from
   * the pool for the mentor check. Present only when the builder was given a
   * picker and the check was not already locked vanilla; the fill world
   * pre-places it.
   */
  uncleWeapon?: string;
  /** ItemPool.py 496-509: heart containers promoted to progression at runtime. */
  promotedHeartContainers: number;
  /** dungeon name → its restricted items (respects the key-drop option). */
  dungeonItems: ReadonlyMap<string, readonly string[]>;
  prizes: readonly string[];
  /** event location name → event item name. */
  eventItems: ReadonlyMap<string, string>;
  startInventory: readonly string[];
}

export type { ApItemPool };
