/* @layer shared-game @kind logic */
import { capacityProgressiveOf } from './capacity-progressive-of';
import type { RandomizerOptionsSnapshot } from '../../options.type';

const capacityProgressiveFromSnapshot = (snapshot: RandomizerOptionsSnapshot): boolean =>
  capacityProgressiveOf(snapshot.values);

export { capacityProgressiveFromSnapshot };
