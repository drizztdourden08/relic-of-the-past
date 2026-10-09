/* @layer shared-game @kind logic */
import { createRng } from '../../../rng';
import { askOfSetting } from '../pond-ask-from-snapshot';
import { pondPlanOf } from '../pond-plan';
import { rollPondDemands } from '../pond-demand-roll';
import { askingPondsOf } from './asking-ponds-of';
import { pondDemandStreamOf } from './pond-demand-stream-of';
import type { PondDemandView } from '../pond-ask.type';
import type { PondDemandInput } from '../pond.type';
import type { ShopPrice } from '../../shops/shop-price.type';

const pondDemandsOfSeed = (input: PondDemandInput): PondDemandView => {
  const { seed, ponds, capacity, itemPool } = input;
  const asking = askingPondsOf(ponds);
  const asksForItem = asking.some(({ setting }) => askOfSetting(setting).item.enabled);
  const pool = asksForItem ? itemPool() : [];
  const rng = createRng(pondDemandStreamOf(seed));
  const demands: Record<string, ShopPrice> = {};
  for (const { pond, setting } of asking) {
    Object.assign(demands, rollPondDemands(
      pondPlanOf(setting, pond), askOfSetting(setting), setting.shape, rng, capacity, pool,
    ));
  }
  return demands;
};

export { pondDemandsOfSeed };
