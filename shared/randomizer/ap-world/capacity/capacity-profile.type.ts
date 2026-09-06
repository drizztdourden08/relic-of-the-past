/* @layer shared-game @kind types */
/**
 * The capacity profile: how each counter family with a ceiling is reshaped
 * for a seed. Vanilla leaves the family untouched (its spot sells the native
 * tiers and is not a check); Vanilla in pool ships the reference's ladder as
 * pool items and turns the spot into a check; Custom picks a start and a
 * final value on the family's own ladder. The start may be the empty rung
 * below the native grid (0: no capacity, no magic, a zero wallet), and a count
 * of pool items and a curve that cuts the climb into exactly that many
 * jumps. Everything derived from
 * a setting (jumps, the preview ladder, the pool items) is a FamilyPlan and
 * is never stored.
 */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

type CapacityMode = 'vanilla' | 'vanilla-in-pool' | 'custom';

type CurveId = 'equal' | 'front' | 'ramp' | 'reverse-fib' | 'geometric';

/** How the climb is cut: a generator, or the user's own jumps (validated to sum to the span). */
type CurveShape = { curve: CurveId } | { curve: 'free'; jumps: readonly number[] };

interface CustomFamilySetting {
  mode: 'custom';
  /** Ladder value the file starts at (0 = the empty rung). */
  start: number;
  /** Ladder value the family may reach (the pond and the wallet stop here). */
  max: number;
  /** Pool items: the In Pool number; clamped to [1, span] at derivation. */
  count: number;
  shape: CurveShape;
}

type FamilySetting =
  | { mode: 'vanilla' }
  | { mode: 'vanilla-in-pool' }
  | CustomFamilySetting;

/** The wallet has no vanilla upgrades, so it is never "in pool". */
type WalletSetting = Exclude<FamilySetting, { mode: 'vanilla-in-pool' }>;

interface CapacityProfile {
  explosives: FamilySetting;
  projectiles: FamilySetting;
  meter: FamilySetting;
  wallet: WalletSetting;
}

/** Derived, never stored. What one family contributes, in every mode. */
interface FamilyPlan {
  /** [] vanilla · the reference jumps · generated or free. */
  jumps: readonly number[];
  /** Cumulative values for the preview: start, then one entry per jump. */
  ladder: readonly number[];
  /** Pool item per jump: items.length IS the In Pool number. */
  items: readonly string[];
  /** False only for vanilla (or a family without a spot). */
  spotIsCheck: boolean;
  /** Custom under the progressive option: every item is the family's one progressive name, jumps taken in order. */
  progressive: boolean;
}

interface CapacityPoolCounts {
  perFamily: Record<CapacityFamilyId, number>;
  /** Σ perFamily − spots that are checks: filler removed (> 0) or added (< 0) to keep the fill 1:1. */
  poolDelta: number;
}

export type {
  CapacityFamilyId,
  CapacityMode,
  CapacityPoolCounts,
  CapacityProfile,
  CurveId,
  CurveShape,
  CustomFamilySetting,
  FamilyPlan,
  FamilySetting,
  WalletSetting,
};
