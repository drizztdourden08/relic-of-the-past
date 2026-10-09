/* @layer renderer-components @kind logic */
import { ARROW_SLOT_INDEXES, RETRO_QUIVER_SLOT_INDEX } from '@shared/randomizer/world/retro/retro-shops';
import { RETRO_QUIVER_PRICE } from '@shared/randomizer/world/retro/retro-bow.data';
import { RETRO_REFILL_ITEM } from '@shared/randomizer/world/retro/retro-shelf.data';
import { CANONICAL_SLOTS } from '@shared/randomizer/world/shops/shop-slot-facts';
import type { ShopSlotFacts } from '@shared/randomizer/world/shops/shop-slot-facts';
import type { RetroBowSetting } from '@shared/randomizer/world/retro/retro.type';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import { retroShuffledNote } from './retro-shuffled-note';
import { retroVanillaNote } from './retro-vanilla-note';

const shelfNameOf = ({ shopName, position }: ShopSlotFacts): string =>
  (position === 'Single' ? shopName : `${shopName} ${position}`);

const retroShopNoteOf = (scope: ShopScope, setting: RetroBowSetting | undefined): string | null => {
  if (setting === undefined || !setting.enabled) return null;
  const quiver = CANONICAL_SLOTS[RETRO_QUIVER_SLOT_INDEX];
  const others = ARROW_SLOT_INDEXES
    .filter((index) => index !== RETRO_QUIVER_SLOT_INDEX)
    .map((index) => shelfNameOf(CANONICAL_SLOTS[index]));
  const shelf = {
    quiverShelf: shelfNameOf(quiver),
    quiverPrice: RETRO_QUIVER_PRICE,
    refill: RETRO_REFILL_ITEM,
    refillPrice: quiver.price,
    otherShelves: others,
  };
  return scope.mode === 'vanilla' ? retroVanillaNote(shelf) : retroShuffledNote(shelf);
};

export { retroShopNoteOf };
