/* @layer shared-game @kind logic */
import type { PondInstance } from '../pond-instance.type';
import type { PondFixedSetting, PondPlan } from '../pond-profile.type';

const vanillaSlotPlan = (setting: PondFixedSetting, pond: PondInstance): PondPlan => {
  const count = Math.max(0, Math.min(setting.items, pond.slots.length));
  return {
    mode: 'vanilla-cost',
    throws: [],
    locations: pond.slots.slice(0, count).map((slot) => slot.key),
    worstPriceOfPrize: Array<number>(count).fill(0),
    totalPrice: 0,
  };
};

export { vanillaSlotPlan };
