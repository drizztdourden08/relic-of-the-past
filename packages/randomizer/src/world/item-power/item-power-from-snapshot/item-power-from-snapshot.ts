/* @layer shared-game @kind logic */
import { itemPowerOfValues } from './item-power-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { ItemPowerSetting } from '@rotp/game-core';

const itemPowerFromSnapshot = (snapshot: RandomizerOptionsSnapshot): ItemPowerSetting =>
  itemPowerOfValues(snapshot.values);

export { itemPowerFromSnapshot };
