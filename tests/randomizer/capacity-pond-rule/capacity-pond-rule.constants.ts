/* @layer tests @kind constants */
import { DEFAULT_ITEM_POWER } from '@rotp/randomizer';
import { defaultProgressiveSetting } from '@rotp/randomizer';
import { defaultShopScope } from '@rotp/randomizer';
import type { CapacityPondAuthority } from '@rotp/randomizer';
import type { PondMode } from '@rotp/randomizer';
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
