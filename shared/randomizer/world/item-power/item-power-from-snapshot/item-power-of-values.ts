/* @layer shared-game @kind logic */
import { DEFAULT_ITEM_POWER, ITEM_POWER_KEY } from '../item-power.data';
import type { OptionValues } from '../../options.type';
import type { ItemPowerSetting } from '../item-power.type';

const flagOf = (values: OptionValues, key: string, fallback: boolean): boolean =>
  (typeof values[key] === 'boolean' ? values[key] : fallback);

const itemPowerOfValues = (values: OptionValues): ItemPowerSetting => ({
  catchFairies: flagOf(values, ITEM_POWER_KEY.catchFairies, DEFAULT_ITEM_POWER.catchFairies),
  byrnaInvulnerable: flagOf(values, ITEM_POWER_KEY.byrnaInvulnerable, DEFAULT_ITEM_POWER.byrnaInvulnerable),
  capeDoubleMagic: flagOf(values, ITEM_POWER_KEY.capeDoubleMagic, DEFAULT_ITEM_POWER.capeDoubleMagic),
  silverArrowsAnywhere: flagOf(values, ITEM_POWER_KEY.silverArrowsAnywhere, DEFAULT_ITEM_POWER.silverArrowsAnywhere),
  powderFairy: flagOf(values, ITEM_POWER_KEY.powderFairy, DEFAULT_ITEM_POWER.powderFairy),
  hammerTablets: flagOf(values, ITEM_POWER_KEY.hammerTablets, DEFAULT_ITEM_POWER.hammerTablets),
  swordlessMedallions: flagOf(
    values, ITEM_POWER_KEY.swordlessMedallions, DEFAULT_ITEM_POWER.swordlessMedallions),
  pullableCurtains: flagOf(values, ITEM_POWER_KEY.pullableCurtains, DEFAULT_ITEM_POWER.pullableCurtains),
  hammerLastFight: flagOf(values, ITEM_POWER_KEY.hammerLastFight, DEFAULT_ITEM_POWER.hammerLastFight),
  hammerTowerSeal: flagOf(values, ITEM_POWER_KEY.hammerTowerSeal, DEFAULT_ITEM_POWER.hammerTowerSeal),
});

export { itemPowerOfValues };
