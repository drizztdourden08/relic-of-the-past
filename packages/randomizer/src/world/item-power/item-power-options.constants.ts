/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
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
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.catchFairies, displayName: msg('randomizer:itemPower.catchFairies.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.catchFairies, baseline: DEFAULT_ITEM_POWER.catchFairies,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.byrnaInvulnerable, displayName: msg('randomizer:itemPower.byrnaInvulnerable.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.byrnaInvulnerable, baseline: DEFAULT_ITEM_POWER.byrnaInvulnerable,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.capeDoubleMagic, displayName: msg('randomizer:itemPower.capeDoubleMagic.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.capeDoubleMagic, baseline: DEFAULT_ITEM_POWER.capeDoubleMagic,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.silverArrowsAnywhere, displayName: msg('randomizer:itemPower.silverArrowsAnywhere.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.silverArrowsAnywhere, baseline: DEFAULT_ITEM_POWER.silverArrowsAnywhere,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.powderFairy, displayName: msg('randomizer:itemPower.powderFairy.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.powderFairy, baseline: DEFAULT_ITEM_POWER.powderFairy,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.hammerTablets, displayName: msg('randomizer:itemPower.hammerTablets.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.hammerTablets, baseline: DEFAULT_ITEM_POWER.hammerTablets,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.swordlessMedallions, displayName: msg('randomizer:itemPower.swordlessMedallions.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.swordlessMedallions, baseline: DEFAULT_ITEM_POWER.swordlessMedallions,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.pullableCurtains, displayName: msg('randomizer:itemPower.pullableCurtains.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.pullableCurtains, baseline: DEFAULT_ITEM_POWER.pullableCurtains,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.hammerLastFight, displayName: msg('randomizer:itemPower.hammerLastFight.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.hammerLastFight, baseline: DEFAULT_ITEM_POWER.hammerLastFight,
  },
  {
    ...ITEM_POWER_TOGGLE, key: ITEM_POWER_KEY.hammerTowerSeal, displayName: msg('randomizer:itemPower.hammerTowerSeal.name'), kind: 'toggle',
    sourceDefault: DEFAULT_ITEM_POWER.hammerTowerSeal, baseline: DEFAULT_ITEM_POWER.hammerTowerSeal,
  },
];

export { ITEM_POWER_OPTION_SEEDS };
