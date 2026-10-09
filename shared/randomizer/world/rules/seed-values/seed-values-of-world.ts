/* @layer shared-game @kind logic */
import { writeShopPrices } from './write-shop-prices';
import { writePondPrices } from './write-pond-prices';
import { writePondDemands } from './write-pond-demands';
import type { World } from '../../world.type';
import type { SeedTable } from '../rules.type';

const seedValuesOfWorld = (world: World): SeedTable => {
  const table: SeedTable = new Map();
  writeShopPrices(world, table);
  writePondPrices(world, table);
  writePondDemands(world, table);
  return table;
};

export { seedValuesOfWorld };
