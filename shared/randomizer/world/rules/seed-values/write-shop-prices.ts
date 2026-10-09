/* @layer shared-game @kind logic */
import { shopSlotLocationOf } from '../../shops/shop-slots';
import { seedKey } from '../seeded-price';
import { writePrice } from './write-price';
import type { World } from '../../world.type';
import type { SeedTable } from '../rules.type';

const writeShopPrices = (world: World, table: SeedTable): void => {
  const rolled = world.options.shopPrices;
  for (const key of world.locationsByKey.keys()) {
    const row = shopSlotLocationOf(key);
    if (row === undefined) continue;
    const price = rolled?.[key] ?? { currency: 'rupees' as const, amount: row.slot.price };
    writePrice(table, seedKey.shopPrice(key), price);
  }
};

export { writeShopPrices };
