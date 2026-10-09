/* @layer shared-game @kind data */
import { DEFAULT_ITEM_POWER, ITEM_POWER_KEY } from './item-power.constants';
import type { OptionSeed } from '../options.type';

const ITEM_POWER_TOGGLE = {
  group: 'items' as const,
  implementation: 'active' as const,
  locked: false,
  synthetic: true,
};

const ITEM_POWER_OPTION_SEEDS: readonly OptionSeed[] = [
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.catchFairies, displayName: 'Net catches fairies', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.catchFairies, baseline: DEFAULT_ITEM_POWER.catchFairies,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.byrnaInvulnerable, displayName: 'Blue barrier protects you', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.byrnaInvulnerable, baseline: DEFAULT_ITEM_POWER.byrnaInvulnerable,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.capeDoubleMagic, displayName: 'Cape drains magic twice as fast', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.capeDoubleMagic, baseline: DEFAULT_ITEM_POWER.capeDoubleMagic,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.silverArrowsAnywhere, displayName: 'Silver arrows bite everywhere', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.silverArrowsAnywhere, baseline: DEFAULT_ITEM_POWER.silverArrowsAnywhere,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.powderFairy, displayName: 'Powder makes a fairy', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.powderFairy, baseline: DEFAULT_ITEM_POWER.powderFairy,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.hammerTablets, displayName: 'Hammer wakes the tablets', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.hammerTablets, baseline: DEFAULT_ITEM_POWER.hammerTablets,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.swordlessMedallions, displayName: 'Medallion doors need no sword', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.swordlessMedallions, baseline: DEFAULT_ITEM_POWER.swordlessMedallions,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.pullableCurtains, displayName: 'Hanging cloth doors can be pulled down', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.pullableCurtains, baseline: DEFAULT_ITEM_POWER.pullableCurtains,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.hammerLastFight, displayName: 'Hammer hurts the last fight', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.hammerLastFight, baseline: DEFAULT_ITEM_POWER.hammerLastFight,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.hammerTowerSeal, displayName: 'Hammer breaks the tower seal', kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.hammerTowerSeal, baseline: DEFAULT_ITEM_POWER.hammerTowerSeal,
  },
];

export { ITEM_POWER_OPTION_SEEDS };
