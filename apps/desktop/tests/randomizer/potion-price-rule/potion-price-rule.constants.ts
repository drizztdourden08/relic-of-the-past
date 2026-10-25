/* @layer tests @kind constants */
import { POTION_CAULDRONS, BOTTLE_CONTENTS, BOTTLE_KEY, bottleContentKeyOf, customSetting, DEFAULT_ITEM_POWER, defaultProgressiveSetting, defaultRetroBow, LEGACY_POND_PROFILES } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import { NEUTRAL_CHOICES } from '../neutral-choices';
import { required } from '../../required';
import type { Values } from './potion-price-rule.type';
import { scopeWith } from './scope-with';

const BASE: Omit<RandomizerOptionChoices, 'shops' | 'shopPrices'> = {
  ...NEUTRAL_CHOICES,
  keyDropShuffle: true,
  deathLink: false,
  includeNpcChecks: false,
  includeWorldItems: false,
  shufflePrizes: false,
  capacityEnabled: true,
  capacity: {
    explosives: customSetting(10, 15, 1),
    projectiles: customSetting(30, 35, 1),
    meter: { mode: 'vanilla-in-pool' },
    wallet: { mode: 'vanilla' },
  },
  capacityProgressive: true,
  ponds: LEGACY_POND_PROFILES,
  progressiveTiers: defaultProgressiveSetting(),
  retroBow: defaultRetroBow(),
  itemPower: DEFAULT_ITEM_POWER,
};

const contentRows = (on: boolean): Values =>
  Object.fromEntries(BOTTLE_CONTENTS.map(({ content }) => [bottleContentKeyOf(content), on]));

const ALL_PRICES: Values = { [BOTTLE_KEY]: true, ...contentRows(true) };
const NO_CONTENTS: Values = { [BOTTLE_KEY]: true, ...contentRows(false) };

const CAULDRON = required(POTION_CAULDRONS[0], 'first potion cauldron');
const BLOCKED_SCOPE = scopeWith([CAULDRON.canonicalIndex], 'custom');

export { ALL_PRICES, BASE, BLOCKED_SCOPE, CAULDRON, NO_CONTENTS };
