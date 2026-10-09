/* @layer shared-game @kind logic */
import { POND_INSTANCES } from '../../pond/pond-instances';
import { POND_RUNGS_BY_ID } from '../../pond/pond-rungs';
import { pondPlanOf } from '../../pond/pond-plan';
import { seedKey } from '../seeded-price';
import { writePrice } from './write-price';
import type { World } from '../../world.type';
import type { SeedTable } from '../rules.type';

const writePondDemands = (world: World, table: SeedTable): void => {
  const { ponds, pondDemands, pondPrizeLocations } = world.options;
  const prizes = new Set(pondPrizeLocations);
  for (const pond of POND_INSTANCES) {
    const setting = ponds?.[pond.id];
    const active = setting !== undefined && setting.mode !== 'capacity' && pondDemands !== undefined;
    const planned = new Set(active ? pondPlanOf(setting, pond).locations : []);
    for (const rung of POND_RUNGS_BY_ID[pond.id]) {
      const demand = planned.has(rung) ? pondDemands?.[rung] : undefined;
      writePrice(table, seedKey.pondDemand(rung), demand);
      table.set(seedKey.pondGated(rung), demand !== undefined && prizes.has(rung));
    }
  }
};

export { writePondDemands };
