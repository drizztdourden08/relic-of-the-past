/* @layer renderer-components @kind logic */
import type { RetroShelfNote } from '../ShopSlotsBlock.type';
import { listedNames } from './listed-names';

const retroVanillaNote = (note: RetroShelfNote): string => {
  const { quiverShelf, quiverPrice, refill, refillPrice, otherShelves } = note;
  const others = otherShelves.length === 0 ? '' : `, and ${listedNames(otherShelves)} the same refill`;
  return `Retro bow: ${quiverShelf} sells the quiver for ${quiverPrice} rupees, then ${refill} refills `
    + `at ${refillPrice}${others}.`;
};

export { retroVanillaNote };
