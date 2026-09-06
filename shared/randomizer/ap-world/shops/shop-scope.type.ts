/* @layer shared-game @kind types */
/**
 * What a profile asks of the shops. The scope is self-contained on purpose:
 * it is frozen onto the placement and read back at session time, and both
 * readings have to name the SAME slots without consulting anything else — so
 * the seed the random mode draws from rides along inside it rather than being
 * passed beside it.
 */

/**
 * How the opened slots are chosen out of the ticked ones.
 * - `vanilla` — nothing is shuffled; every shop behaves as it always has.
 * - `sequential` — the first `slotCount` ticked slots, in canonical order.
 * - `random` — `slotCount` ticked slots drawn from `seed`.
 * - `custom` — exactly the ticked slots; the count is not consulted at all.
 */
type ShopShuffleMode = 'vanilla' | 'sequential' | 'random' | 'custom';

interface ShopScope {
  mode: ShopShuffleMode;
  /**
   * Canonical slot indices the player ticked, ascending. This is the set every
   * mode draws from, so a mode can never promise a slot that does not exist.
   */
  enabled: readonly number[];
  /** How many ticked slots the counted modes open. */
  slotCount: number;
  /** Purchases each opened slot carries, 1..5. */
  depth: number;
  /** Seed the random mode's draw is made from; the other modes ignore it. */
  seed: string;
}

export type { ShopScope, ShopShuffleMode };
