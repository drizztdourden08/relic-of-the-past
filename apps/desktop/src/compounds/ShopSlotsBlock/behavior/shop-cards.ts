/* @layer renderer-components @kind logic */
import { itemKeyName, SHOP_IDS, shortShopNameOf, DEFAULT_OFF_SHOPS, SHOP_SLOT_ROWS } from '@rotp/randomizer';
import type { ShopScope, ShopSlotRow } from '@rotp/randomizer';
import { STOCK_SEPARATOR } from '../ShopSlotsBlock.constants';
import type { ShopCardModel, ShopSlotToggleModel } from '../ShopSlotsBlock.type';

const stockOf = (slot: ShopSlotRow['slot']): string =>
  (slot.vanillaItem === undefined ? '' : itemKeyName(slot.vanillaItem));

const rowsOfShop = (shopId: string): readonly ShopSlotRow[] =>
  SHOP_SLOT_ROWS.filter((row) => row.slot.shopId === shopId);

const slotLabelOf = (row: ShopSlotRow, slotCount: number): string =>
  (slotCount === 1 || row.slot.position === 'Single' ? stockOf(row.slot) : row.slot.position);

const toggleOf = (row: ShopSlotRow, slotCount: number, ticked: ReadonlySet<number>): ShopSlotToggleModel => ({
  key: row.key,
  label: slotLabelOf(row, slotCount),
  canonicalIndex: row.canonicalIndex,
  checked: ticked.has(row.canonicalIndex),
});

const shopCardsOf = (scope: ShopScope): readonly ShopCardModel[] => {
  const ticked = new Set(scope.enabled);
  return SHOP_IDS.map((shopId) => {
    const rows = rowsOfShop(shopId);
    const slots = rows.map((row) => toggleOf(row, rows.length, ticked));
    const [{ slot: first }] = rows;
    return {
      id: shopId,
      name: shortShopNameOf(shopId, first.shopName),
      world: first.world,
      stock: rows.map((row) => stockOf(row.slot)).join(STOCK_SEPARATOR),
      offByDefault: DEFAULT_OFF_SHOPS.includes(shopId),
      slots,
      noneOn: slots.every((slot) => !slot.checked),
    };
  });
};

export { shopCardsOf };
export type { ShopCardModel, ShopSlotToggleModel };
