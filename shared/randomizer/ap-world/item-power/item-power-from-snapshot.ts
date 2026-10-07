/* @layer shared-game @kind logic */
/**
 * The item-power rows ⇄ the setting they stand for, both directions in one
 * file so the reading the generator uses and the writing the creation form
 * freezes can never spell the same option two ways.
 *
 * A snapshot frozen before these rows existed carries none of them, and an
 * absent key falls back to the normal step, the unmodified game every stored
 * placement was generated under.
 */
import { DEFAULT_ITEM_POWER, ITEM_POWER_KEY } from './item-power.data';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { ItemPowerSetting } from './item-power.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const flagOf = (values: Values, key: string, fallback: boolean): boolean =>
  (typeof values[key] === 'boolean' ? values[key] : fallback);

const itemPowerOfValues = (values: Values): ItemPowerSetting => ({
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

const itemPowerFromSnapshot = (snapshot: RandomizerOptionsSnapshot): ItemPowerSetting =>
  itemPowerOfValues(snapshot.values);

/** The rows a setting freezes: what the creation form hands the catalog. */
const itemPowerValuesOf = (setting: ItemPowerSetting): Record<string, ApOptionValue> => ({
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

export { itemPowerFromSnapshot, itemPowerOfValues, itemPowerValuesOf };
