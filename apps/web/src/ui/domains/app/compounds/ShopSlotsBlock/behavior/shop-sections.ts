/* @layer renderer-components @kind logic */
/**
 * The card grid, split into the sections it is headed by: one per half of the
 * overworld, each in the dataset's own canonical order.
 *
 * The split is read off the shops themselves rather than from a list kept
 * here, so a shop added to the dataset lands in a section without this file
 * being touched — and a section with no shop in it is dropped rather than
 * drawn empty.
 */
import { SHOP_WORLD_LABELS } from '@shared/randomizer/ap-world/shops/shops.data';
import { shopCardsOf } from './shop-cards';
import type { ShopCardModel } from './shop-cards';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';
import type { ShopWorld } from '@shared/randomizer/ap-world/shops/shops.data';

interface ShopSectionModel {
  world: ShopWorld;
  /** The heading, which is why the cards under it drop their world words. */
  title: string;
  cards: readonly ShopCardModel[];
}

/** The order the sections are drawn in — the world the game opens in first. */
const SECTION_ORDER: readonly ShopWorld[] = ['light', 'dark'];

const shopSectionsOf = (scope: ShopScope): readonly ShopSectionModel[] => {
  const cards = shopCardsOf(scope);
  return SECTION_ORDER
    .map((world) => ({
      world,
      title: SHOP_WORLD_LABELS[world],
      cards: cards.filter((card) => card.world === world),
    }))
    .filter((section) => section.cards.length > 0);
};

export { shopSectionsOf };
export type { ShopSectionModel };
