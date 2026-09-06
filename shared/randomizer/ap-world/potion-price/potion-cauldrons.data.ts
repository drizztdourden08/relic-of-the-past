/* @layer shared-game @kind data */
/**
 * The hut's cauldrons paired with the bottle content each one sells, derived
 * from the shop dataset rather than restated here: a cauldron shop's slot
 * whose stock names a bottle content IS that content's only repeatable
 * source. A cauldron selling something else (were one ever added) simply
 * pairs with nothing and the rule ignores it.
 *
 * The pairing is by canonical slot index, which is what the scope ticks, so
 * a dataset edit that moves a slot moves this with it.
 */
import { CANONICAL_SLOTS } from '../shops/shop-slots';
import { BOTTLE_CONTENTS } from '../shops/shop-price-options.data';
import type { ShopBottleContent } from '../shops/shop-price.type';

interface PotionCauldron {
  /** The slot the scope ticks. */
  canonicalIndex: number;
  /** The content that slot is the repeatable source of. */
  content: ShopBottleContent;
  /** The content in the player's words, for the note. */
  label: string;
  /** Rupees the cauldron charges — what a wallet must hold to buy the content back. */
  price: number;
}

const LABEL_OF: ReadonlyMap<string, string> = new Map(
  BOTTLE_CONTENTS.map(({ content, label }) => [content, label]),
);

/** 'Red Potion' → 'red-potion'; undefined when the stock is not a bottle content. */
const contentOfStock = (vanillaItem: string): ShopBottleContent | undefined => {
  const id = vanillaItem.toLowerCase().replace(/\s+/g, '-');
  return LABEL_OF.has(id) ? id as ShopBottleContent : undefined;
};

const POTION_CAULDRONS: readonly PotionCauldron[] = CANONICAL_SLOTS.flatMap((canonical) => {
  if (canonical.shop.kind !== 'cauldron') return [];
  const content = contentOfStock(canonical.slot.vanillaItem);
  return content === undefined
    ? []
    : [{
      canonicalIndex: canonical.canonicalIndex,
      content,
      label: LABEL_OF.get(content) ?? content,
      price: canonical.slot.price,
    }];
});

/** The contents a cauldron is the source of — the only ones this rule can ever block. */
const CAULDRON_CONTENTS: readonly ShopBottleContent[] = POTION_CAULDRONS.map((row) => row.content);

/** What a cauldron charges for its content; undefined for a content nobody sells. */
const cauldronPriceOf = (content: string): number | undefined =>
  POTION_CAULDRONS.find((row) => row.content === content)?.price;

export { CAULDRON_CONTENTS, POTION_CAULDRONS, cauldronPriceOf };
export type { PotionCauldron };
