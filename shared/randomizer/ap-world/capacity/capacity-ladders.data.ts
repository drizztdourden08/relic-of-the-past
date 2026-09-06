/* @layer shared-game @kind data */
/**
 * The value ladders of the four capacity families — mirrors of the core's
 * tier tables and rung convention (core/game-hooks/capacity_tiers.h). Every
 * ladder opens with RUNG 0, the empty tier below the native grid: no
 * explosives or projectiles at all, an unusable meter, a zero wallet. Rung
 * r ≥ 1 is native level r − 1, so the three native grids keep the engine's
 * own arithmetic (+5 six times, then +10; three meter levels) one rung up,
 * and a vanilla file stands on the rung VANILLA_RUNG names. A start or max
 * is always one of these values and a jump is a number of rungs. The wallet
 * cap table is ours, so its ladder is as fine as the curves need: 100-rupee
 * steps ending in 99 like the vanilla 999, from 0 to 9999, 101 values.
 */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

/** Rung 0 = none; rungs 1-8 = the native tier bytes 0-7. */
const EXPLOSIVES_TIERS: readonly number[] = [0, 10, 15, 20, 25, 30, 35, 40, 50];

/** Rung 0 = none; rungs 1-8 = the native tier bytes 0-7. */
const PROJECTILES_TIERS: readonly number[] = [0, 30, 35, 40, 45, 50, 55, 60, 70];

/** Rung 0 = no magic; rungs 1-3 = the native cost levels 0-2 (full · half · quarter). */
const METER_TIERS: readonly number[] = [0, 1, 2, 3];

/**
 * The meter rungs named as the game names them: its cost tiers. The meter is a
 * fixed bar, so a rung is not an amount it holds — it is what one use costs.
 * Rung 0 is the empty tier below the native grid, where nothing can be cast.
 */
const METER_LEVEL_LABELS: readonly string[] = ['none', 'normal', 'half', 'quarter'];

/** Index 0 ⇒ 0; index i ≥ 1 ⇒ 100 · i − 1, i = 1 … 100 (rung 10 = 999, rung 100 = 9999). */
const WALLET_LADDER_LAST = 100;
const WALLET_LADDER: readonly number[] =
  Array.from({ length: WALLET_LADDER_LAST + 1 }, (_, index) => (index === 0 ? 0 : 100 * index - 1));

/** The rung a vanilla file stands on: the first native level, the 999 wallet. */
const VANILLA_RUNG: Readonly<Record<CapacityFamilyId, number>> = {
  explosives: 1,
  projectiles: 1,
  meter: 1,
  wallet: 10,
};

export {
  EXPLOSIVES_TIERS,
  METER_LEVEL_LABELS,
  METER_TIERS,
  PROJECTILES_TIERS,
  VANILLA_RUNG,
  WALLET_LADDER,
  WALLET_LADDER_LAST,
};
