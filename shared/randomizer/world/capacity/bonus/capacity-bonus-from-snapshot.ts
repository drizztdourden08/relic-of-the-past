/* @layer shared-game @kind logic */
import { capacityBonusOfValues } from './capacity-bonus-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { CapacityBonusSetting } from './capacity-bonus.type';

const capacityBonusFromSnapshot = (snapshot: RandomizerOptionsSnapshot): CapacityBonusSetting =>
  capacityBonusOfValues(snapshot.values);

export { capacityBonusFromSnapshot };
