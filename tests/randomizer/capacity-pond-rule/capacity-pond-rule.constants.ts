/* @layer tests @kind constants */
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/world/item-power/item-power.data';
import { defaultProgressiveSetting } from '@shared/randomizer/world/progressive/progressive-from-snapshot';
import { defaultShopScope } from '@shared/randomizer/world/shops/shop-scope-from-values';
import type { CapacityPondAuthority } from '@shared/randomizer/world/capacity-pond';
import type { PondMode } from '@shared/randomizer/world/pond/pond-profile.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

const POND_MODES: readonly PondMode[] = ['capacity', 'vanilla-cost', 'custom'];
const FAMILY_MODES = ['vanilla', 'vanilla-in-pool', 'custom'] as const;
const AUTHORITIES: readonly CapacityPondAuthority[] = ['pond', 'capacity', 'explosives', 'projectiles', 'meter', 'wallet'];

const BASE_CHOICES: Omit<RandomizerOptionChoices, 'capacityEnabled' | 'capacity' | 'pond' | 'retroBow'> = {
  keyDropShuffle: true,
  includeNpcChecks: false,
  includeWorldItems: false,
  shufflePrizes: false,
  shops: defaultShopScope(),
  shopPrices: {},
  capacityProgressive: true,
  progressiveTiers: defaultProgressiveSetting(),
  itemPower: DEFAULT_ITEM_POWER,
};

export { AUTHORITIES, BASE_CHOICES, FAMILY_MODES, POND_MODES };
