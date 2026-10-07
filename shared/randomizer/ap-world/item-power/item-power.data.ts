/* @layer shared-game @kind data */
/**
 * The catalog keys the item-power switches occupy, and the reading each one
 * has under the reference's four steps (Rom.py patch_rom 817-870, 1045-1047).
 * The default row IS the normal step, the unmodified game.
 *
 * What each of the four steps really did is written down where a reader will
 * look for it: on the locked transcription row's own description, beside the
 * switches it points at.
 */
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

const ITEM_POWER_OPTION_KEYS: readonly string[] = Object.values(ITEM_POWER_KEY);

/** Rom.py 862-868: the normal step, which is the unmodified game. */
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
