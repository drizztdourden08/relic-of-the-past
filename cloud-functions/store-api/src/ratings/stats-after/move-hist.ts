/* @layer store-api @kind logic */
import type { Stars } from '../../../../../shared/store/rating-types';
import type { ItemStats } from '../../../../../shared/store/types';

const moveHist = (hist: ItemStats['ratingHist'], previous: Stars | null, next: Stars | null): ItemStats['ratingHist'] => {
  const moved: ItemStats['ratingHist'] = [...hist];
  if (previous !== null) moved[previous - 1] = Math.max(0, moved[previous - 1] - 1);
  if (next !== null) moved[next - 1] += 1;
  return moved;
};

export { moveHist };
