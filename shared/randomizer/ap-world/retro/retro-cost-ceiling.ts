/* @layer shared-game @kind logic */
/**
 * How high the two shot-cost sliders may go under a profile.
 *
 * The seed is never asked to refuse a cost: the sliders stop where the wallet
 * does. The plain shot may cost up to the wallet family's reachable top
 * (capacity/reachable-top.ts, the same rung the shelf prices are capped at),
 * held under the core's own ceiling (retro_bow.c clamps at 999). The silver
 * shot has to be fired the final fight's count of times back to back with
 * nothing to farm in between (final-fight.data.ts), so its ceiling is that
 * top divided by the count, rounded down to a whole rupee.
 *
 * A stored cost above either ceiling is held at it on read, so a profile
 * whose wallet was shrunk after the costs were set still rolls.
 */
import { WALLET } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.data';
import { RETRO_PRICE_CEILING } from './retro-bow.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { RetroBowSetting } from './retro.type';

interface RetroCostCeilings {
  /** The most a plain shot may cost: the wallet's top, under the core's ceiling. */
  wood: number;
  /** The most a silver shot may cost: the final fight's shots must fit the wallet at once. */
  silver: number;
}

const retroCostCeilingsOf = (profile: CapacityProfile): RetroCostCeilings => {
  const top = Math.min(RETRO_PRICE_CEILING, reachableTopOf(WALLET, profile));
  return { wood: top, silver: Math.floor(top / FINAL_FIGHT_SILVER_HITS) };
};

/** The setting held under its ceilings; unchanged when both costs already fit. */
const heldRetroBow = (setting: RetroBowSetting, ceilings: RetroCostCeilings): RetroBowSetting => {
  const woodArrowCost = Math.min(setting.woodArrowCost, ceilings.wood);
  const silverArrowCost = Math.min(setting.silverArrowCost, ceilings.silver);
  if (woodArrowCost === setting.woodArrowCost && silverArrowCost === setting.silverArrowCost) return setting;
  return { ...setting, woodArrowCost, silverArrowCost };
};

export { heldRetroBow, retroCostCeilingsOf };
export type { RetroCostCeilings };
