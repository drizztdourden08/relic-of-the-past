/* @layer shared-game @kind logic */
import { optionFlagOf } from '../../option-flag-of';
import { DEFAULT_ITEM_POWER, ITEM_POWER_KEY } from '../item-power.data';
import type { OptionValues } from '../../options.type';
import type { ItemPowerSetting } from '@rotp/game-core';

const itemPowerOfValues = (values: OptionValues): ItemPowerSetting => ({
  catchFairies: optionFlagOf(values, ITEM_POWER_KEY.catchFairies, DEFAULT_ITEM_POWER.catchFairies),
  byrnaInvulnerable: optionFlagOf(values, ITEM_POWER_KEY.byrnaInvulnerable, DEFAULT_ITEM_POWER.byrnaInvulnerable),
  capeDoubleMagic: optionFlagOf(values, ITEM_POWER_KEY.capeDoubleMagic, DEFAULT_ITEM_POWER.capeDoubleMagic),
  silverArrowsAnywhere: optionFlagOf(values, ITEM_POWER_KEY.silverArrowsAnywhere, DEFAULT_ITEM_POWER.silverArrowsAnywhere),
  powderFairy: optionFlagOf(values, ITEM_POWER_KEY.powderFairy, DEFAULT_ITEM_POWER.powderFairy),
  hammerTablets: optionFlagOf(values, ITEM_POWER_KEY.hammerTablets, DEFAULT_ITEM_POWER.hammerTablets),
  swordlessMedallions: optionFlagOf(
    values, ITEM_POWER_KEY.swordlessMedallions, DEFAULT_ITEM_POWER.swordlessMedallions),
  pullableCurtains: optionFlagOf(values, ITEM_POWER_KEY.pullableCurtains, DEFAULT_ITEM_POWER.pullableCurtains),
  hammerLastFight: optionFlagOf(values, ITEM_POWER_KEY.hammerLastFight, DEFAULT_ITEM_POWER.hammerLastFight),
  hammerTowerSeal: optionFlagOf(values, ITEM_POWER_KEY.hammerTowerSeal, DEFAULT_ITEM_POWER.hammerTowerSeal),
});

export { itemPowerOfValues };
