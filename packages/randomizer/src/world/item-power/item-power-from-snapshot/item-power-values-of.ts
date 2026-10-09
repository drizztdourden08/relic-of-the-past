/* @layer shared-game @kind logic */
import { ITEM_POWER_KEY } from '../item-power.constants';
import type { OptionValue } from '../../options.type';
import type { ItemPowerSetting } from '@rotp/game-core';

const itemPowerValuesOf = (setting: ItemPowerSetting): Record<string, OptionValue> => ({
  [ITEM_POWER_KEY.catchFairies]: setting.catchFairies,
  [ITEM_POWER_KEY.byrnaInvulnerable]: setting.byrnaInvulnerable,
  [ITEM_POWER_KEY.capeDoubleMagic]: setting.capeDoubleMagic,
  [ITEM_POWER_KEY.silverArrowsAnywhere]: setting.silverArrowsAnywhere,
  [ITEM_POWER_KEY.powderFairy]: setting.powderFairy,
  [ITEM_POWER_KEY.hammerTablets]: setting.hammerTablets,
  [ITEM_POWER_KEY.swordlessMedallions]: setting.swordlessMedallions,
  [ITEM_POWER_KEY.pullableCurtains]: setting.pullableCurtains,
  [ITEM_POWER_KEY.hammerLastFight]: setting.hammerLastFight,
  [ITEM_POWER_KEY.hammerTowerSeal]: setting.hammerTowerSeal,
});

export { itemPowerValuesOf };
