/* @layer shared-game @kind types */
/**
 * The pond profile: what the rupee pond hands out, and what it charges.
 * Capacity (the legacy default) leaves the pond exactly as the capacity
 * families describe it: its two slots sell the native tiers and become
 * checks only when their family is not vanilla. The other three modes turn
 * the pond into a sequence of THROWS: throw t costs price[t] rupees, paid in
 * one toss, and hands over either the next pool item or a climb of the
 * family the player picked. Vanilla cost reproduces the native economy (one
 * hundred rupees per upgrade, fourteen upgrades); Custom cuts a price ladder
 * with the capacity curves; Gamble sells a fixed number of chances whose
 * winning throws are drawn once from the seed. Everything derived from a
 * setting (the prices, the prize schedule, the locations) is a PondPlan and
 * is never stored.
 */
import type { CurveShape } from '../capacity/capacity-profile.type';

type PondMode = 'capacity' | 'vanilla-cost' | 'custom' | 'gamble';

interface PondCustomSetting {
  mode: 'custom';
  /** Ladder value (rupees) of the first throw. */
  start: number;
  /** Ladder value (rupees) of the last throw. */
  max: number;
  /** How many throws the pond sells; the price ladder has exactly this many entries. */
  throws: number;
  /** Pool items in the pond: the In Pool number; 0 makes the pond no check at all. */
  items: number;
  shape: CurveShape;
}

/**
 * A mode whose prices are a fixed schedule, not a stored range. It
 * needs no wallet ceiling: the dearest throw either schedule sells is 240,
 * and the wallet floor keeps every reachable top well above that.
 */
interface PondFixedSetting {
  mode: 'vanilla-cost' | 'gamble';
  items: number;
}

type PondSetting =
  | { mode: 'capacity' }
  | (PondFixedSetting & { mode: 'vanilla-cost' })
  | (PondFixedSetting & { mode: 'gamble' })
  | PondCustomSetting;

/** One purchase at the pond. */
interface PondThrow {
  /** Rupees this throw costs, paid in a single toss. */
  price: number;
  /** Prize ordinal handed over, or -1 when the throw climbs capacity instead. */
  prize: number;
  /** Rupees handed back when the throw wins nothing (Gamble only; always below `price`). */
  refund: number;
}

/** Derived, never stored. What the pond sells for one setting and one seed. */
interface PondPlan {
  mode: PondMode;
  /** [] for the legacy mode: the pond keeps its native purchase loop. */
  throws: readonly PondThrow[];
  /** Pool locations in prize order; [] when the pond is not a check source. */
  locations: readonly string[];
  /**
   * The largest single price on the way to prize k, which the wallet must hold.
   * Guaranteed worst case: every earlier throw must be paid to reach this one,
   * so no reading of it ever depends on luck.
   */
  worstPriceOfPrize: readonly number[];
  /** Every price added up: what the whole pond costs to empty. */
  totalPrice: number;
}

export type { PondCustomSetting, PondFixedSetting, PondMode, PondPlan, PondSetting, PondThrow };
