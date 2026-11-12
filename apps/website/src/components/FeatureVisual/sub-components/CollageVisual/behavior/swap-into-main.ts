/* @layer website-site @kind logic */
import type { CollageArrangement, Flip } from '../CollageVisual.type';

const flipOf = (flip: Flip | undefined): Flip => (flip === 0 ? 1 : 0);

const swapIntoMain = (arrangement: CollageArrangement, index: number): CollageArrangement => {
  const { slots, flips } = arrangement;
  const mainIndex = slots.indexOf('main');
  const vacated = slots[index];
  if (mainIndex < 0 || index === mainIndex || !vacated) return arrangement;
  return {
    slots: slots.map((slot, at) => {
      if (at === index) return 'main';
      return at === mainIndex ? vacated : slot;
    }),
    flips: flips.map((flip, at) => (at === index || at === mainIndex ? flipOf(flip) : flip)),
  };
};

export { swapIntoMain };
