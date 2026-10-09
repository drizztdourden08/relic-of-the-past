/* @layer shared-game @kind logic */
import { CAPACITY_POND } from '../pond-instances';
import { POND_RUNGS_BY_ID } from '../pond-rungs';
import { EMPTY_PLAN, NO_PRIZE, NO_REFUND } from './pond-plan.constants';
import { scheduleOf } from './schedule-of';
import { vanillaSlotPlan } from './vanilla-slot-plan';
import type { PondInstance } from '../pond-instance.type';
import type { PondPlan, PondSetting, PondThrow } from '../pond-profile.type';

const sellsUpgrades = (pond: PondInstance): boolean => pond.id === CAPACITY_POND.id;

const pondPlanOf = (setting: PondSetting, pond: PondInstance = CAPACITY_POND): PondPlan => {
  if (setting.mode === 'capacity') return EMPTY_PLAN;
  if (setting.mode === 'vanilla-cost' && !sellsUpgrades(pond)) return vanillaSlotPlan(setting, pond);
  const { prices, prizeAt } = scheduleOf(setting);
  const throws: PondThrow[] = prices.map((price, index) => (
    { price, prize: prizeAt.get(index) ?? NO_PRIZE, refund: NO_REFUND }));
  const worstPriceOfPrize: number[] = [];
  let worst = 0;
  for (const entry of throws) {
    worst = Math.max(worst, entry.price);
    if (entry.prize >= 0) worstPriceOfPrize[entry.prize] = worst;
  }
  return {
    mode: setting.mode,
    throws,
    locations: POND_RUNGS_BY_ID[pond.id].slice(0, worstPriceOfPrize.length),
    worstPriceOfPrize,
    totalPrice: prices.reduce((sum, price) => sum + price, 0),
  };
};

export { pondPlanOf };
