/* @layer shared-game @kind logic */
/**
 * Which pool item a rung names.
 *
 * The player does NOT have to be holding it when the demand is rolled: going
 * and getting it is the point. The access rule is `state.has(name)`
 * (rules/shop-prices.ts) and the fill's own solver is what makes that safe,
 * since it reads the name as an ordinary requirement and routes or rerolls
 * around it.
 *
 * THE CANDIDATES. Only names the player can hold and the core can test
 * (pond-demand-eligibility.ts). An empty list means this pond cannot ask for
 * an item at all, and the roll drops the kind (pond-demand-roll.ts).
 *
 * THE BIAS. The candidates are ranked by where the unmodified game hands each
 * one over along its route (pond-demand-order.data.ts), earliest first. A
 * rung's position on the climb picks a window in that ranking: the first rung
 * draws from the early end, the last from the late end, with the draw inside
 * the window the one thing the rng decides.
 *
 * THE BOUND. Every candidate comes from the pool that was handed in, so a
 * demand can never name an item this seed does not carry, and the window is
 * held inside the ranking, so neither end can run off it.
 */
import { isDemandableItem } from './pond-demand-eligibility';
import { DEMAND_ITEM_RANK } from './pond-demand-order.data';
import type { Rng } from '../../rng';

/** How much of the ranking one rung may draw from, as a share of the whole. */
const WINDOW_SHARE = 0.2;

const rankOf = (name: string): number => DEMAND_ITEM_RANK.get(name) ?? DEMAND_ITEM_RANK.size;

/**
 * The pool's demandable names as a ranking, early to late, once each. Two
 * names with the same rank fall in name order, so a seed cannot depend on the
 * order the pool happened to be built in.
 */
const demandCandidatesOf = (itemPool: readonly string[]): readonly string[] =>
  [...new Set(itemPool.filter(isDemandableItem))].sort((left, right) => {
    const byRank = rankOf(left) - rankOf(right);
    return byRank !== 0 ? byRank : left.localeCompare(right);
  });

/** The unused name nearest the centre of the ranking, or none when every name is used. */
const nearestUnused = (candidates: readonly string[], centre: number, used: ReadonlySet<string>): string | undefined =>
  candidates
    .map((name, index) => ({ name, distance: Math.abs(index - centre) }))
    .filter(({ name }) => !used.has(name))
    .sort((left, right) => left.distance - right.distance)[0]?.name;

/**
 * One name for a rung standing at `position` on the climb (0 is the first
 * rung, 1 the last), from a non-empty candidate ranking. A name another rung
 * of this pond already asks for is skipped, so no item is asked twice while
 * an unused one remains; the window widens to the nearest unused name when
 * its own are spent. One draw, and only when the window holds more than one
 * unused name, so a pond with nothing used draws exactly as before.
 */
const pickDemandItem = (
  candidates: readonly string[], position: number, rng: Rng, used: ReadonlySet<string> = new Set(),
): string => {
  const window = Math.max(1, Math.round(candidates.length * WINDOW_SHARE));
  const centre = Math.round(position * (candidates.length - 1));
  const low = Math.min(Math.max(0, centre - Math.floor(window / 2)), Math.max(0, candidates.length - window));
  const open = candidates.slice(low, low + window).filter((name) => !used.has(name));
  if (open.length === 0) {
    const nearest = nearestUnused(candidates, centre, used);
    if (nearest !== undefined) return nearest;
    return candidates[low + (window === 1 ? 0 : rng.int(window))];
  }
  return open[open.length === 1 ? 0 : rng.int(open.length)];
};

export { demandCandidatesOf, pickDemandItem };
