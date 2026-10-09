/* @layer bridge-wasm @kind logic */
import type { ItemPowerSetting } from '@shared/randomizer/world/item-power/item-power.type';
import { ITEM_POWER_BIT } from './item-power.constants';

const itemPowerWordOf = (setting: ItemPowerSetting): number => {
  let word = 0;
  if (!setting.catchFairies) word |= ITEM_POWER_BIT.noFairyCatching;
  if (!setting.byrnaInvulnerable) word |= ITEM_POWER_BIT.noByrnaBarrierGuard;
  if (setting.capeDoubleMagic) word |= ITEM_POWER_BIT.capeDoubleMagic;
  if (!setting.silverArrowsAnywhere) word |= ITEM_POWER_BIT.silverArrowsBossOnly;
  if (!setting.powderFairy) word |= ITEM_POWER_BIT.noPowderFairy;
  if (setting.hammerTablets) word |= ITEM_POWER_BIT.hammerWakesTablets;
  if (setting.swordlessMedallions) word |= ITEM_POWER_BIT.swordlessMedallions;
  if (setting.pullableCurtains) word |= ITEM_POWER_BIT.pullableCurtains;
  if (setting.hammerLastFight) word |= ITEM_POWER_BIT.hammerLastFight;
  if (setting.hammerTowerSeal) word |= ITEM_POWER_BIT.hammerBreaksSeal;
  return word;
};

export { itemPowerWordOf };
