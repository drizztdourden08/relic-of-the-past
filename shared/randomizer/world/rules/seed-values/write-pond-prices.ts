/* @layer shared-game @kind logic */
import { POND_LOCATION_SET } from '../../pond/pond-rungs';
import { pondPricesOf } from '../prices';
import { seedKey } from '../seeded-price';
import { TABLE_PRICE } from './seed-values.constants';
import type { World } from '../../world.type';
import type { SeedTable } from '../rules.type';

const writePondPrices = (world: World, table: SeedTable): void => {
  const pondPrices = pondPricesOf(world);
  for (const key of world.locationsByKey.keys()) {
    if (!POND_LOCATION_SET.has(key)) continue;
    table.set(seedKey.pondPrice(key), pondPrices.get(key) ?? TABLE_PRICE.get(key) ?? 0);
  }
};

export { writePondPrices };
