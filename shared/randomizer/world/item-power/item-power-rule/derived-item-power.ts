/* @layer shared-game @kind logic */
import type { ItemPowerSetting } from '../item-power.type';

const derivedItemPower = (
  requested: ItemPowerSetting, sword: boolean, beamSword: boolean,
): ItemPowerSetting => ({
  ...requested,
  hammerTablets: requested.hammerTablets || !beamSword,
  swordlessMedallions: requested.swordlessMedallions || !sword,
  pullableCurtains: requested.pullableCurtains || !sword,
  hammerLastFight: requested.hammerLastFight || !beamSword,
  hammerTowerSeal: requested.hammerTowerSeal || !beamSword,
});

export { derivedItemPower };
