/* @layer shared-game @kind logic */
/**
 * The post-fill accessibility verdict: the single-world reading of
 * BaseClasses.MultiWorld.fulfills_accessibility (Archipelago main, quoted in
 * accessibility.type.ts). The source walks only the locations it calls
 * RELEVANT and stops as soon as every one of them that has to be COLLECTED
 * has been, with the goal reached:
 *
 *   location_relevant(loc)  = loc.player in full  or  loc.advancement
 *   location_condition(loc) = loc.player in full  or  loc.item.player not in minimal
 *
 * With one player that collapses to a table:
 *   full:    every location relevant, every one required
 *   items:   only advancement-item locations relevant, all of them required
 *   minimal: only advancement-item locations relevant, NONE required
 * and in every mode the goal must be reachable.
 *
 * The caller's sweep runs to a fixpoint over the whole world instead of
 * stopping early, which can only collect MORE than the source's walk, so the
 * missing set below is a subset of the source's, so a seed this accepts is one
 * the source accepts.
 *
 * A story event of the world is an event location to the source, holding an
 * advancement event item, so one the sweep never made happen fails `full` and
 * `items` alike, exactly as that location would.
 */
import { PRIZE_ITEMS } from '../pool/prize-items.data';
import { isProgressionUnder } from '../pool/progression-class';
import type { CheckId } from '@shared/game/data/types/ids';
import type { AccessibilityMode } from './accessibility.type';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const AUTO_ADVANCEMENT: ReadonlySet<ItemKey> = new Set<ItemKey>(PRIZE_ITEMS);

/**
 * python Item.advancement for the items this world can place: the pool's
 * progression partition (progression-class.ts, which the fill itself uses),
 * plus the dungeon rewards, advancement in Items.py and never in the shuffled
 * pool.
 */
const advancementItemsOf = (capacity: CapacityProfile): ((item: ItemKey) => boolean) => {
  const isProgression = isProgressionUnder(capacity);
  return (item: ItemKey): boolean => AUTO_ADVANCEMENT.has(item) || isProgression(item);
};

interface AccessibilityInput {
  mode: AccessibilityMode;
  capacity: CapacityProfile;
  /** Locations the verification sweep never reached. */
  uncollected: readonly LocationKey[];
  /** Story events the verification sweep never made happen. */
  missedEvents: readonly CheckId[];
  /** location name → the item sitting on it. */
  placedItems: ReadonlyMap<LocationKey, ItemKey>;
}

/**
 * The uncollectable locations and missed story events this mode refuses to
 * ship. Empty means the placement satisfies its accessibility contract (the
 * goal check is the caller's, and is asked in every mode).
 */
const accessibilityFailures = (input: AccessibilityInput): string[] => {
  const { mode, capacity, uncollected, missedEvents, placedItems } = input;
  if (mode === 'minimal') return [];
  if (mode === 'full') return [...uncollected, ...missedEvents];
  const isAdvancement = advancementItemsOf(capacity);
  return [
    ...uncollected.filter((key) => {
      const item = placedItems.get(key);
      return item !== undefined && isAdvancement(item);
    }),
    ...missedEvents,
  ];
};

export { accessibilityFailures, advancementItemsOf };
export type { AccessibilityInput };
