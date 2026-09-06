/* @layer renderer-components @kind logic */
/**
 * The bottle-content rows the price block draws: one per content a shelf may
 * demand, already matched against the potion rule.
 *
 * The rule is read ONCE, here, and each content is answered for on its own
 * line. That is the whole point: a cauldron blocks its OWN content and nothing
 * else, so a row carries its own blocked flag and its own sentence rather than
 * the block carrying a list of sentences underneath five rows that all look
 * alike. Ticking the red cauldron greys the red row, says why on that row, and
 * leaves blue and green exactly as they were.
 */
import {
  BOTTLE_CONTENTS, bottleContentKeyOf,
} from '@shared/randomizer/ap-world/shops/shop-price-options.data';
import { blockedContentNote, potionPriceStateOfValues } from '@shared/randomizer/ap-world/potion-price';
import type { ApOptionValue } from '@shared/randomizer/ap-world/options.type';
import type { ShopBottleContent } from '@shared/randomizer/ap-world/shops/shop-price.type';

type Values = Readonly<Record<string, ApOptionValue>>;

interface BottleContentRowModel {
  content: ShopBottleContent;
  /** The content in the player's own words. */
  label: string;
  /** Its catalog key — what an edit on this row writes. */
  key: string;
  checked: boolean;
  /** Its cauldron went to the shuffle: the row is greyed and cannot be ticked. */
  blocked: boolean;
  /** Why this row is greyed; empty while it is not. */
  note: string;
}

const bottleContentRowsOf = (values: Values): readonly BottleContentRowModel[] => {
  const { blockedKeys } = potionPriceStateOfValues(values);
  return BOTTLE_CONTENTS.map(({ content, label }) => {
    const key = bottleContentKeyOf(content);
    const blocked = blockedKeys.has(key);
    return { content, label, key, checked: values[key] !== false, blocked, note: blocked ? blockedContentNote(label) : '' };
  });
};

export { bottleContentRowsOf };
export type { BottleContentRowModel };
