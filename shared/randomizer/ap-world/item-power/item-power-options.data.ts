/* @layer shared-game @kind data */
/**
 * The seven item-power rows of the option catalog — synthetic, unlocked, group
 * 'items'. They replace the reference's single four-step Item Functionality
 * choice, which stays in the catalog, locked, as the transcription of its
 * dataclass. Every baseline is the normal step, so a fresh profile plays the
 * unmodified game and a snapshot frozen before these rows existed reads the
 * same way.
 */
import { DEFAULT_ITEM_POWER, ITEM_POWER_KEY } from './item-power.data';
import type { ApOptionDef } from '../options.type';

type Seed = Omit<ApOptionDef, 'description'>;

const base = {
  group: 'items' as const,
  implementation: 'active' as const,
  locked: false,
  synthetic: true,
};

const toggle = (key: string, displayName: string, baseline: boolean): Seed =>
  ({ ...base, key, displayName, kind: 'toggle', apDefault: baseline, baseline });

const ITEM_POWER_OPTION_SEEDS: readonly Seed[] = [
  toggle(ITEM_POWER_KEY.catchFairies, 'Net catches fairies', DEFAULT_ITEM_POWER.catchFairies),
  toggle(ITEM_POWER_KEY.byrnaInvulnerable, 'Blue barrier protects you', DEFAULT_ITEM_POWER.byrnaInvulnerable),
  toggle(ITEM_POWER_KEY.capeDoubleMagic, 'Cape drains magic twice as fast', DEFAULT_ITEM_POWER.capeDoubleMagic),
  toggle(ITEM_POWER_KEY.silverArrowsAnywhere, 'Silver arrows bite everywhere',
    DEFAULT_ITEM_POWER.silverArrowsAnywhere),
  toggle(ITEM_POWER_KEY.powderFairy, 'Powder makes a fairy', DEFAULT_ITEM_POWER.powderFairy),
  toggle(ITEM_POWER_KEY.hammerTablets, 'Hammer wakes the tablets', DEFAULT_ITEM_POWER.hammerTablets),
  toggle(ITEM_POWER_KEY.swordlessMedallions, 'Medallion doors need no sword',
    DEFAULT_ITEM_POWER.swordlessMedallions),
  toggle(ITEM_POWER_KEY.pullableCurtains, 'Hanging cloth doors can be pulled down',
    DEFAULT_ITEM_POWER.pullableCurtains),
  toggle(ITEM_POWER_KEY.hammerLastFight, 'Hammer hurts the last fight',
    DEFAULT_ITEM_POWER.hammerLastFight),
  toggle(ITEM_POWER_KEY.hammerTowerSeal, 'Hammer breaks the tower seal',
    DEFAULT_ITEM_POWER.hammerTowerSeal),
];

export { ITEM_POWER_OPTION_SEEDS };
