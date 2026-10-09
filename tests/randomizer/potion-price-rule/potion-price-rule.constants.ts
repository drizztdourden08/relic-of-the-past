/* @layer tests @kind constants */
import { POTION_CAULDRONS } from '@shared/randomizer/world/potion-price';
import {
  BOTTLE_CONTENTS, BOTTLE_KEY, bottleContentKeyOf,
} from '@shared/randomizer/world/shops/shop-price-options.data';
import { customSetting } from '@shared/randomizer/world/capacity';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/world/item-power/item-power.data';
import { defaultProgressiveSetting } from '@shared/randomizer/world/progressive/progressive-from-snapshot';
import { LEGACY_POND_PROFILES } from '@shared/randomizer/world/pond/pond-profile-defaults';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { Values } from './potion-price-rule.type';
import { scopeWith } from './scope-with';

const BASE: Omit<RandomizerOptionChoices, 'shops' | 'shopPrices'> = {
  keyDropShuffle: true,
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
  itemPower: DEFAULT_ITEM_POWER,
};

const contentRows = (on: boolean): Values =>
  Object.fromEntries(BOTTLE_CONTENTS.map(({ content }) => [bottleContentKeyOf(content), on]));

const ALL_PRICES: Values = { [BOTTLE_KEY]: true, ...contentRows(true) };
const NO_CONTENTS: Values = { [BOTTLE_KEY]: true, ...contentRows(false) };

const CAULDRON = POTION_CAULDRONS[0];
const BLOCKED_SCOPE = scopeWith([CAULDRON.canonicalIndex], 'custom');

export { ALL_PRICES, BASE, BLOCKED_SCOPE, CAULDRON, NO_CONTENTS };
