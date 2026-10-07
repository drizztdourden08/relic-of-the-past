/* @layer renderer-components @kind logic */
/**
 * The card model the shop grid renders: one card per shop, its slots already
 * grouped, labelled and matched against the scope's ticked set.
 *
 * Every derivation lives here instead of in the card. The card is handed a
 * name, a line of text and a list of toggles, and knows nothing about
 * canonical indices, which shops start unticked or how a shelf position turns
 * into a label, so it stays a presentational unit and this file stays the one
 * place the shop-slot records are read for the panel.
 *
 * The name is the SHORT one: the grid is headed by world, so a card repeating
 * the half it is already filed under says nothing.
 */
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { SHOP_IDS } from '@shared/randomizer/world/shops/shop-slot-facts';
import { shortShopNameOf } from '@shared/randomizer/world/shops/shop-list-name';
import { DEFAULT_OFF_SHOPS, SHOP_SLOT_ROWS } from '@shared/randomizer/world/shops/shop-slot-options.data';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import type { ShopSlotRow } from '@shared/randomizer/world/shops/shop-slot-options.data';
import type { ShopWorld } from '@shared/randomizer/world/shops/shop-slot-facts';

/** One slot of a shop, as the card draws it. */
interface ShopSlotToggleModel {
  key: string;
  /** Its shelf position, or what it sells when the shop holds only one slot. */
  label: string;
  canonicalIndex: number;
  checked: boolean;
}

interface ShopCardModel {
  /** The shop's own id, so it identifies the card in a list. */
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

/** A shop's own rows, in shelf order. */
/** What a shelf normally sells, read off the record its own check points at. */
const stockOf = (slot: ShopSlotRow['slot']): string =>
  (slot.vanillaItem === undefined ? '' : itemKeyName(slot.vanillaItem));

const rowsOfShop = (shopId: string): readonly ShopSlotRow[] =>
  SHOP_SLOT_ROWS.filter((row) => row.slot.shopId === shopId);

/** A lone slot has no shelf position worth naming, so it wears its stock instead. */
const slotLabelOf = (row: ShopSlotRow, slotCount: number): string =>
  (slotCount === 1 || row.slot.position === 'Single' ? stockOf(row.slot) : row.slot.position);

const toggleOf = (row: ShopSlotRow, slotCount: number, ticked: ReadonlySet<number>): ShopSlotToggleModel => ({
  key: row.key,
  label: slotLabelOf(row, slotCount),
  canonicalIndex: row.canonicalIndex,
  checked: ticked.has(row.canonicalIndex),
});

/** Every shop as a card, in canonical order, read against this scope's ticks. */
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
