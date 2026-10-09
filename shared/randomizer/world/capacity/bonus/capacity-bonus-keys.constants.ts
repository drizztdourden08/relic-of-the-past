/* @layer shared-game @kind constants */
import { CAPACITY_FAMILY_IDS } from '@rotp/game-data';
import { capacityBonusBaseKeyOf } from './capacity-bonus-base-key-of';
import { capacityBonusKeyOf } from './capacity-bonus-key-of';

const CAPACITY_BONUS_KEYS: readonly string[] = CAPACITY_FAMILY_IDS.flatMap((family) =>
  [capacityBonusKeyOf(family), capacityBonusBaseKeyOf(family)]);

export { CAPACITY_BONUS_KEYS };
