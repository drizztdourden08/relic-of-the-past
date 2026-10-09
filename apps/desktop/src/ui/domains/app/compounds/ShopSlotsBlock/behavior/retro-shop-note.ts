/* @layer renderer-components @kind logic */
import { ARROW_SLOT_INDEXES, RETRO_QUIVER_SLOT_INDEX } from '@rotp/randomizer';
import { RETRO_QUIVER_PRICE } from '@rotp/randomizer';
import { RETRO_REFILL_ITEM } from '@rotp/randomizer';
import { CANONICAL_SLOTS } from '@rotp/randomizer';
import type { ShopSlotFacts } from '@rotp/randomizer';
import type { RetroBowSetting } from '@rotp/randomizer';
import type { ShopScope } from '@rotp/randomizer';
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
