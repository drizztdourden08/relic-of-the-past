/* @layer tests @kind helper */
import { POTION_CAULDRONS } from '@rotp/randomizer';

const cauldronSubsets = (): number[][] => {
  const all: number[][] = [];
  for (let mask = 0; mask < 2 ** POTION_CAULDRONS.length; mask += 1) {
    all.push(POTION_CAULDRONS
      .filter((_row, index) => (mask & (1 << index)) !== 0)
      .map((row) => row.canonicalIndex));
  }
  return all;
};

export { cauldronSubsets };
