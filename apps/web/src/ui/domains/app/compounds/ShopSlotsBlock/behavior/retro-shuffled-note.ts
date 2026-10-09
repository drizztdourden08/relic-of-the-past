/* @layer renderer-components @kind logic */
import type { RetroShelfNote } from '../ShopSlotsBlock.type';
import { listedNames } from './listed-names';

const retroShuffledNote = (note: RetroShelfNote): string => {
  const { quiverShelf, otherShelves } = note;
  const others = otherShelves.length === 0 ? '' : ` with ${listedNames(otherShelves)}`;
  return `Retro bow: the quiver is in the item pool, so ${quiverShelf} always opens as a shuffled slot${others}.`;
};

export { retroShuffledNote };
