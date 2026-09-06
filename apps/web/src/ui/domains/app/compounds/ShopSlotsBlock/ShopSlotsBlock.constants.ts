/* @layer renderer-components @kind constants */
/**
 * The block's fixed copy and its mode list. Kept beside the component rather
 * than inside it so the sentences a player reads are one short file to review,
 * and the component stays layout.
 */
import { SHOP_MODE_LABELS } from '@shared/randomizer/ap-world/shops/shop-slot-options.data';
import { SHOP_SHUFFLE_MODES } from '@shared/randomizer/ap-world/shops/shop-scope';

/** The dropdown, in the catalog's own order, vanilla first. */
const MODE_OPTIONS = SHOP_SHUFFLE_MODES.map((mode) => ({ value: mode, label: SHOP_MODE_LABELS[mode] }));

const MODE_TITLE = 'Shop shuffle';

const SLOTS_TITLE = 'Shop slots';

const SLOT_COUNT_LABEL = 'Available shop slots';

const SLOT_COUNT_INERT = 'Only the Sequential and Random modes read this';

/** Said beside the read-out in the mode where the ticks alone decide the count. */
const SLOT_COUNT_FOLLOWS_TICKS = 'Set by the ticks above';

/** The counted modes' own line: the number is a choice, out of the set below it. */
const slotCountCeiling = (ticked: number): string => `Out of the ${ticked} ticked`;

const DEPTH_LABEL = 'Items per shop slot';

const VANILLA_TOTAL = 'Nothing shuffled.';

/** The shelves retro bow touches, named and priced off the dataset (behavior/retro-shop-note.ts). */
interface RetroShelfNote {
  quiverShelf: string;
  quiverPrice: number;
  refill: string;
  refillPrice: number;
  /** Every other shelf that sold arrows; empty when the quiver's is the only one. */
  otherShelves: readonly string[];
}

const listed = (names: readonly string[]): string =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/** Under retro with vanilla shops: stock changes in place, nothing is shuffled. One sentence. */
const retroVanillaNote = (note: RetroShelfNote): string => {
  const { quiverShelf, quiverPrice, refill, refillPrice, otherShelves } = note;
  const others = otherShelves.length === 0 ? '' : `, and ${listed(otherShelves)} the same refill`;
  return `Retro bow: ${quiverShelf} sells the quiver for ${quiverPrice} rupees, then ${refill} refills `
    + `at ${refillPrice}${others}.`;
};

/** Under retro with shuffled shops: the quiver is in the pool and its shelf is an ordinary slot. One sentence. */
const retroShuffledNote = (note: RetroShelfNote): string => {
  const { quiverShelf, otherShelves } = note;
  const others = otherShelves.length === 0 ? '' : ` with ${listed(otherShelves)}`;
  return `Retro bow: the quiver is in the item pool, so ${quiverShelf} always opens as a shuffled slot${others}.`;
};

export {
  DEPTH_LABEL, MODE_OPTIONS, MODE_TITLE, SLOTS_TITLE, SLOT_COUNT_FOLLOWS_TICKS, SLOT_COUNT_INERT,
  SLOT_COUNT_LABEL, VANILLA_TOTAL, retroShuffledNote, retroVanillaNote, slotCountCeiling,
};
export type { RetroShelfNote };
