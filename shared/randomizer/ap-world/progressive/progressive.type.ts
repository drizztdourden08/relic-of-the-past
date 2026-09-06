/* @layer shared-game @kind types */
/**
 * Which tiers of a progressive family exist at all in a seed. The reference
 * project asks this as one blunt toggle per family at most — a swordless
 * switch and nothing else — which conflates two different questions: how many
 * copies of the family's item the pool carries, and which concrete tiers those
 * copies hand over. This app asks it per tier, because that is the shape a
 * player thinks in: "no gold blade", "keep the first shield only", "no bow at
 * all". Unticking every tier of the blade family IS the reference's swordless
 * setting, derived rather than asked for twice.
 *
 * A tick list is read positionally against the family's tier table: entry k is
 * the k-th tier. Pickups climb the TICKED tiers in order, so unticking a middle
 * tier does not leave a hole — the copy after it simply hands over the next
 * ticked tier instead. A shorter or absent list reads as every tier ticked, so
 * a snapshot frozen before these rows existed keeps the pool it was rolled with.
 */

/** The five families whose items arrive one tier at a time. */
type ProgressiveFamilyId = 'sword' | 'shield' | 'mail' | 'glove' | 'bow';

/**
 * How a family's copies reach the player.
 *
 * `progressive` is the reference's own reading and this app's default: the
 * pool carries one nameless copy per ticked rung, and each copy hands over the
 * next rung up. Order is guaranteed, so the first copy found is always the
 * bottom of the ladder.
 *
 * `random` puts the rungs in as THEMSELVES — separate items that may be found
 * in any order, so the top of a ladder can turn up first and really is that
 * tier when it does. A rung found after a higher one already held is surplus
 * rather than a step back down; the core's own ladder reading answers that,
 * because it resolves against live inventory rather than against a count.
 */
type ProgressiveFamilyMode = 'progressive' | 'random';

/** One mode per family — the whole per-family reading a seed is generated under. */
type ProgressiveModeSetting = Readonly<Record<ProgressiveFamilyId, ProgressiveFamilyMode>>;

/** One boolean per tier of a family, in tier order. */
type ProgressiveTierTicks = readonly boolean[];

/** Every family's tick list — the whole setting a seed is generated under. */
type ProgressiveSetting = Readonly<Record<ProgressiveFamilyId, ProgressiveTierTicks>>;

/** One family's catalog row: what it puts in the pool and which tiers it climbs. */
interface ProgressiveFamilyDef {
  id: ProgressiveFamilyId;
  /** Shown as the card heading. */
  label: string;
  /** The item name the pool carries one copy of per ticked tier. */
  poolItem: string;
  /** The concrete tiers, in climb order; one tick row each. */
  tiers: readonly string[];
  /** Short per-tier labels for the tick boxes, positional with `tiers`. */
  tierLabels: readonly string[];
}

export type {
  ProgressiveFamilyDef, ProgressiveFamilyId, ProgressiveFamilyMode, ProgressiveModeSetting,
  ProgressiveSetting, ProgressiveTierTicks,
};
