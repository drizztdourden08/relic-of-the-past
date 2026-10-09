/* @layer shared-game @kind logic */
import { POND_VANILLA_PRICE, POND_VANILLA_THROWS } from '../pond-ladder.constants';
import { customPricesOf } from './custom-prices-of';
import { leadingPrizes } from './leading-prizes';
import type { ActivePondSetting, PondSchedule } from '../pond.type';

const scheduleOf = (setting: ActivePondSetting): PondSchedule => {
  const prices = setting.mode === 'vanilla-cost'
    ? Array<number>(POND_VANILLA_THROWS).fill(POND_VANILLA_PRICE)
    : customPricesOf(setting);
  return { prices, prizeAt: leadingPrizes(setting.items, prices.length) };
};

export { scheduleOf };
