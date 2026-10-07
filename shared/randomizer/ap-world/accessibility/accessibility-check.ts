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
 */
import { EVENT_ITEMS, PRIZE_ITEMS } from '../pool/event-items.data';
import { isProgressionUnder } from '../pool/progression-class';
import type { AccessibilityMode } from './accessibility.type';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const AUTO_ADVANCEMENT: ReadonlySet<string> = new Set([...PRIZE_ITEMS, ...EVENT_ITEMS.values()]);

/**
 * python Item.advancement for the names this world can place: the pool's
 * progression partition (progression-class.ts, which the fill itself uses),
 * plus the dungeon rewards and the event items, both advancement in
 * Items.py, and neither one ever sits in the shuffled pool.
 */
const advancementItemsOf = (capacity: CapacityProfile): ((itemName: string) => boolean) => {
  const isProgression = isProgressionUnder(capacity);
  return (itemName: string): boolean => AUTO_ADVANCEMENT.has(itemName) || isProgression(itemName);
};

interface AccessibilityInput {
  mode: AccessibilityMode;
  capacity: CapacityProfile;
  /** Locations the verification sweep never reached. */
  uncollected: readonly string[];
  /** location name → the item sitting on it. */
  placedItems: ReadonlyMap<string, string>;
}

/**
 * The uncollectable locations this mode refuses to ship. Empty means the
 * placement satisfies its accessibility contract (the goal check is the
 * caller's, and is asked in every mode).
 */
const accessibilityFailures = (input: AccessibilityInput): string[] => {
  const { mode, capacity, uncollected, placedItems } = input;
  if (mode === 'minimal') return [];
  if (mode === 'full') return [...uncollected];
  const isAdvancement = advancementItemsOf(capacity);
  return uncollected.filter((name) => {
    const item = placedItems.get(name);
    return item !== undefined && isAdvancement(item);
  });
};

export { accessibilityFailures, advancementItemsOf };
export type { AccessibilityInput };
