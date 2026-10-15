/* @layer renderer-components @kind logic */
import { SHOP_WORLD_LABELS } from '@rotp/randomizer';
import type { ShopScope } from '@rotp/randomizer';
import { SECTION_ORDER } from '../ShopSlotsBlock.constants';
import type { ShopSectionModel } from '../ShopSlotsBlock.type';
import { shopCardsOf } from './shop-cards';

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
