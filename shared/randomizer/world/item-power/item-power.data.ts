/* @layer shared-game @kind data */
import type { ItemPowerSetting } from './item-power.type';

const ITEM_POWER_KEY = {
  catchFairies: 'item_power_catch_fairies',
  byrnaInvulnerable: 'item_power_byrna_barrier',
  capeDoubleMagic: 'item_power_cape_magic_double',
  silverArrowsAnywhere: 'item_power_silver_arrows_anywhere',
  powderFairy: 'item_power_powder_fairy',
  hammerTablets: 'item_power_hammer_tablets',
  swordlessMedallions: 'item_power_medallions_swordless',
  pullableCurtains: 'item_power_curtains_pullable',
  hammerLastFight: 'item_power_hammer_last_fight',
  hammerTowerSeal: 'item_power_hammer_tower_seal',
} as const satisfies Readonly<Record<keyof ItemPowerSetting, string>>;

const ITEM_POWER_OPTION_KEYS: readonly string[] = [
  ITEM_POWER_KEY.catchFairies,
  ITEM_POWER_KEY.byrnaInvulnerable,
  ITEM_POWER_KEY.capeDoubleMagic,
  ITEM_POWER_KEY.silverArrowsAnywhere,
  ITEM_POWER_KEY.powderFairy,
  ITEM_POWER_KEY.hammerTablets,
  ITEM_POWER_KEY.swordlessMedallions,
  ITEM_POWER_KEY.pullableCurtains,
  ITEM_POWER_KEY.hammerLastFight,
  ITEM_POWER_KEY.hammerTowerSeal,
];

const DEFAULT_ITEM_POWER: ItemPowerSetting = {
  catchFairies: true,
  byrnaInvulnerable: true,
  capeDoubleMagic: false,
  silverArrowsAnywhere: true,
  powderFairy: true,
  hammerTablets: false,
  swordlessMedallions: false,
  pullableCurtains: false,
  hammerLastFight: false,
  hammerTowerSeal: false,
};

export { DEFAULT_ITEM_POWER, ITEM_POWER_KEY, ITEM_POWER_OPTION_KEYS };
