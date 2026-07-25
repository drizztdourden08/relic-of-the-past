/* @layer shared-game @kind logic */
/**
 * Vanilla duplicate-item rule (Link_HandleChest, player.c:3850): a handful of
 * chest items swap to an alternate when the primary is already owned — the Lamp
 * chest hands out 5 Rupees once you have a lamp.
 *
 * Lives here because FOUR things name a chest's contents: the simulator's
 * delivery, the sim log, the overlay annotation and the C hook. The first three
 * must apply this rule from one place or the overlay promises a Lamp the run will
 * never deliver; the C hook applies the same rule as a backstop.
 */
import { ITEM_ID_TO_NAME } from './id-map';

const DUPLICATE_ALTERNATES: Record<number, number> = {
  0x0c: 0x44, // Blue Boomerang → 10 Arrows
  0x12: 0x35, // Lamp → 5 Rupees
  0x2a: 0x46, // Red Boomerang → 300 Rupees
};

/** The item this chest actually yields, given what Link already carries. */
const resolveDuplicate = (itemId: number, owned: ReadonlySet<string>): number => {
  const alt = DUPLICATE_ALTERNATES[itemId];
  if (alt === undefined) return itemId;
  return owned.has(ITEM_ID_TO_NAME[itemId] ?? '') ? alt : itemId;
};

/** True when this item would be swapped out — the caller may want to say so. */
const isDuplicated = (itemId: number, owned: ReadonlySet<string>): boolean =>
  resolveDuplicate(itemId, owned) !== itemId;

const itemLabel = (itemId: number): string => ITEM_ID_TO_NAME[itemId] ?? `item 0x${itemId.toString(16)}`;

export { resolveDuplicate, isDuplicated, itemLabel, DUPLICATE_ALTERNATES };
