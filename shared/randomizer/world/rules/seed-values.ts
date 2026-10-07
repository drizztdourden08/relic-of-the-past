/* @layer shared-game @kind logic */
/**
 * The seed table: every value a seeded rule reads, as one world settled it. The rules
 * themselves are registered with one shape for every seed (prices.ts, pond-demands.ts); what a
 * seed rolled, and what the settings made of a pond, lives here instead:
 *
 *   shopPrice:<slot>     the price the shelf charges: the rolled one, or its vanilla rupees;
 *   pondPrice:<slot>     the rupees a pond slot's wallet must hold: the pond plan's worst case
 *                        for a prize slot it sells, the price table's own row otherwise, and 0
 *                        (no gate) for a slot neither one prices;
 *   pondDemand:<rung>    what that rung of the pond's ladder demands, `none` when nothing was
 *                        rolled for it;
 *   pondGated:<rung>     whether the rung carries its ladder at all: a prize slot the world
 *                        sells, with a demand of its own.
 *
 * A price spreads over the fields seeded-price.ts reads (currency, amount, item, count,
 * overLimit, content); every field is written, so the table has one shape too.
 */
import { BASELINE } from '../state-helpers';
import { itemKeyOfName } from '../display-names/item-key-name';
import { POND_INSTANCES } from '../pond/pond-instances';
import { POND_LOCATION_SET, POND_RUNGS_BY_ID } from '../pond/pond-rungs';
import { pondPlanOf } from '../pond/pond-plan';
import { shopSlotLocationOf } from '../shops/shop-slots';
import { PRICED_ENTRIES } from './priced-entries';
import { pondPricesOf } from './prices';
import { priceField, seedKey } from './seeded-price';
import type { SeedValue, World } from '../world.type';
import type { ShopPrice } from '../shops/shop-price.type';

type SeedTable = Map<string, SeedValue>;

/** One price, or none, spread over its fields. */
const writePrice = (table: SeedTable, prefix: string, price: ShopPrice | undefined): void => {
  const count = price?.currency === 'bottle' ? price.amount ?? 1 : 1;
  const counted = price !== undefined && price.currency !== 'bottle' && price.currency !== 'item';
  table.set(priceField.currency(prefix), price?.currency ?? 'none');
  table.set(priceField.amount(prefix), counted ? price.amount : 0);
  table.set(priceField.item(prefix), price?.currency === 'item' ? itemKeyOfName(price.itemName) : '');
  table.set(priceField.count(prefix), count);
  table.set(priceField.overLimit(prefix), count > BASELINE.progressiveBottleLimit);
  table.set(priceField.content(prefix), price?.currency === 'bottle' ? price.content : '');
};

const TABLE_PRICE: ReadonlyMap<string, number> = new Map(
  PRICED_ENTRIES.filter((entry) => entry.kind === 'location').map((entry) => [entry.target, entry.price]),
);

const writeShopPrices = (world: World, table: SeedTable): void => {
  const rolled = world.options.shopPrices;
  for (const key of world.locationsByKey.keys()) {
    const row = shopSlotLocationOf(key);
    if (row === undefined) continue;
    const price = rolled?.[key] ?? { currency: 'rupees' as const, amount: row.slot.price };
    writePrice(table, seedKey.shopPrice(key), price);
  }
};

const writePondPrices = (world: World, table: SeedTable): void => {
  const pondPrices = pondPricesOf(world);
  for (const key of world.locationsByKey.keys()) {
    if (!POND_LOCATION_SET.has(key)) continue;
    table.set(seedKey.pondPrice(key), pondPrices.get(key) ?? TABLE_PRICE.get(key) ?? 0);
  }
};

/** Every rung of every pond: the demand its plan rolled, and whether the rung is gated by it. */
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

/** The whole table for one world, from the values its options carry. */
const seedValuesOfWorld = (world: World): SeedTable => {
  const table: SeedTable = new Map();
  writeShopPrices(world, table);
  writePondPrices(world, table);
  writePondDemands(world, table);
  return table;
};

export { seedValuesOfWorld, writePrice };
export type { SeedTable };
