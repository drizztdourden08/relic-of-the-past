/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { POND_INSTANCES } from '../../pond/pond-instances';
import { pondPlanOf } from '../../pond/pond-plan';
import type { LocationKey } from '../../location-key.type';
import type { World } from '../../world.type';

const pondPricesOf = (world: World): ReadonlyMap<LocationKey, number> => {
  const { ponds, pondPrizeLocations } = world.options;
  const prices = new Map<LocationKey, number>();
  if (ponds === undefined) return prices;
  const prizes = new Set(pondPrizeLocations);
  for (const pond of POND_INSTANCES) {
    const setting = ponds[pond.id];
    if (setting.mode === 'capacity') continue;
    const plan = pondPlanOf(setting, pond);
    plan.locations.forEach((key, index) => {
      if (prizes.has(key)) prices.set(key, itemAt(plan.worstPriceOfPrize, index));
    });
  }
  return prices;
};

export { pondPricesOf };
