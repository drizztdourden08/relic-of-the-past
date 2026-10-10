/* @layer bridge-wasm @kind logic */
import type { ItemPowerSetting } from '../world/item-power/item-power.type';
import { ITEM_POWER_BIT } from './item-power.constants';

const itemPowerWordOf = (setting: ItemPowerSetting): number => {
  const bits: readonly (readonly [boolean, number])[] = [
    [!setting.catchFairies, ITEM_POWER_BIT.noFairyCatching],
    [!setting.byrnaInvulnerable, ITEM_POWER_BIT.noByrnaBarrierGuard],
    [setting.capeDoubleMagic, ITEM_POWER_BIT.capeDoubleMagic],
    [!setting.silverArrowsAnywhere, ITEM_POWER_BIT.silverArrowsBossOnly],
    [!setting.powderFairy, ITEM_POWER_BIT.noPowderFairy],
    [setting.hammerTablets, ITEM_POWER_BIT.hammerWakesTablets],
    [setting.swordlessMedallions, ITEM_POWER_BIT.swordlessMedallions],
    [setting.pullableCurtains, ITEM_POWER_BIT.pullableCurtains],
    [setting.hammerLastFight, ITEM_POWER_BIT.hammerLastFight],
    [setting.hammerTowerSeal, ITEM_POWER_BIT.hammerBreaksSeal],
  ];
  return bits.reduce((word, [on, bit]) => (on ? word | bit : word), 0);
};

export { itemPowerWordOf };
