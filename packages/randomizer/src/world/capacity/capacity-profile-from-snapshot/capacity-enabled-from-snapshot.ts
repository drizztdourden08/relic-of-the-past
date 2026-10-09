/* @layer shared-game @kind logic */
import { capacityEnabledOf } from './capacity-enabled-of';
import type { RandomizerOptionsSnapshot } from '../../options.type';

const capacityEnabledFromSnapshot = (snapshot: RandomizerOptionsSnapshot): boolean =>
  capacityEnabledOf(snapshot.values);

export { capacityEnabledFromSnapshot };
