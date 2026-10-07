/* @layer renderer-components @kind logic */
/**
 * The one line the Shops tab adds under the mode while retro bow is on: what
 * the shelves that sold arrows sell now, and whether any of it is shuffled.
 *
 * Retro is decided on the Items tab, and its one shop consequence depends on
 * the mode chosen HERE, so the sentence is drawn where the mode is. Both
 * shelf names and prices come off the dataset through the same helpers the
 * seed and the core read, so the note can never describe a shelf the game
 * does not stock that way.
 */
import { ARROW_SLOT_INDEXES, RETRO_QUIVER_SLOT_INDEX } from '@shared/randomizer/ap-world/retro/retro-shops';
import { RETRO_QUIVER_PRICE } from '@shared/randomizer/ap-world/retro/retro-bow.data';
import { RETRO_REFILL_ITEM } from '@shared/randomizer/ap-world/retro/retro-shelf.data';
import { CANONICAL_SLOTS } from '@shared/randomizer/ap-world/shops/shop-slots';
import { retroShuffledNote, retroVanillaNote } from '../ShopSlotsBlock.constants';
import type { CanonicalShopSlot } from '@shared/randomizer/ap-world/shops/shop-slots';
import type { RetroBowSetting } from '@shared/randomizer/ap-world/retro/retro.type';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';

/** The shelf as its location is named: the shop, then the shelf position. */
const shelfNameOf = ({ shop, slot }: CanonicalShopSlot): string =>
  slot.position === 'Single' ? shop.name : `${shop.name} ${slot.position}`;

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
    refillPrice: quiver.slot.price,
    otherShelves: others,
  };
  return scope.mode === 'vanilla' ? retroVanillaNote(shelf) : retroShuffledNote(shelf);
};

export { retroShopNoteOf };
