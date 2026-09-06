/* @layer renderer-components @kind logic */
/**
 * The card model the shop grid renders: one card per shop, its slots already
 * grouped, labelled and matched against the scope's ticked set.
 *
 * Every derivation lives here instead of in the card. The card is handed a
 * name, a line of text and a list of toggles, and knows nothing about
 * canonical indices, which shops start unticked or how a shelf position turns
 * into a label, so it stays a presentational unit and this file stays the one
 * place the dataset is read.
 *
 * The name is the SHORT one: the grid is headed by world, so a card repeating
 * the half it is already filed under says nothing.
 */
import { DEFAULT_OFF_SHOPS, SHOP_DEFS, shortShopNameOf } from '@shared/randomizer/ap-world/shops/shops.data';
import { SHOP_SLOT_ROWS } from '@shared/randomizer/ap-world/shops/shop-slot-options.data';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';
import type { ShopSlotRow } from '@shared/randomizer/ap-world/shops/shop-slot-options.data';
import type { ShopWorld } from '@shared/randomizer/ap-world/shops/shops.data';

/** One slot of a shop, as the card draws it. */
interface ShopSlotToggleModel {
  key: string;
  /** Its shelf position, or what it sells when the shop holds only one slot. */
  label: string;
  canonicalIndex: number;
  checked: boolean;
}

interface ShopCardModel {
  /** The shop's full name, unique, so it identifies the card in a list. */
  id: string;
  /** The shop's own name, less the world words its section already says. */
  name: string;
  /** Which section lists it. */
  world: ShopWorld;
  /** What the unmodified shop sells, in shelf order: the card's caption line. */
  stock: string;
  /** This shop's slots start unticked, and the card says so on its face. */
  offByDefault: boolean;
  slots: readonly ShopSlotToggleModel[];
  /** Nothing ticked here: the card dims, and this shop is never chosen. */
  noneOn: boolean;
}

/** Reads as one sentence of stock instead of a list of separate things. */
const STOCK_SEPARATOR = ' · ';

/**
 * A shop's own rows, in shelf order. Matched by name because four shops share
 * one inventory array, so a slot cannot say which shop it belongs to.
 */
const rowsOfShop = (shopName: string): readonly ShopSlotRow[] =>
  SHOP_SLOT_ROWS.filter((row) => row.shop.name === shopName);

/** A lone slot has no shelf position worth naming, so it wears its stock instead. */
const slotLabelOf = (row: ShopSlotRow, slotCount: number): string =>
  (slotCount === 1 || row.slot.position === 'Single' ? row.slot.vanillaItem : row.slot.position);

const toggleOf = (row: ShopSlotRow, slotCount: number, ticked: ReadonlySet<number>): ShopSlotToggleModel => ({
  key: row.key,
  label: slotLabelOf(row, slotCount),
  canonicalIndex: row.canonicalIndex,
  checked: ticked.has(row.canonicalIndex),
});

/** Every shop as a card, in canonical order, read against this scope's ticks. */
const shopCardsOf = (scope: ShopScope): readonly ShopCardModel[] => {
  const ticked = new Set(scope.enabled);
  return SHOP_DEFS.map((shop) => {
    const rows = rowsOfShop(shop.name);
    const slots = rows.map((row) => toggleOf(row, rows.length, ticked));
    return {
      id: shop.name,
      name: shortShopNameOf(shop),
      world: shop.world,
      stock: rows.map((row) => row.slot.vanillaItem).join(STOCK_SEPARATOR),
      offByDefault: DEFAULT_OFF_SHOPS.includes(shop.name),
      slots,
      noneOn: slots.every((slot) => !slot.checked),
    };
  });
};

export { shopCardsOf };
export type { ShopCardModel, ShopSlotToggleModel };
