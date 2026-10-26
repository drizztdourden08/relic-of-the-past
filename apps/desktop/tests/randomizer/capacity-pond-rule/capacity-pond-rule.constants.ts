/* @layer tests @kind constants */
import { DEFAULT_ITEM_POWER, defaultProgressiveSetting, defaultShopScope } from '@rotp/randomizer';
import type { CapacityPondAuthority, PondMode } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import { NEUTRAL_CHOICES } from '../neutral-choices';

const POND_MODES: readonly PondMode[] = ['capacity', 'vanilla-cost', 'custom'];
const FAMILY_MODES = ['vanilla', 'vanilla-in-pool', 'custom'] as const;
const AUTHORITIES: readonly CapacityPondAuthority[] = ['pond', 'capacity', 'explosives', 'projectiles', 'meter', 'wallet'];

const BASE_CHOICES: Omit<RandomizerOptionChoices, 'capacityEnabled' | 'capacity' | 'ponds' | 'retroBow'> = {
  ...NEUTRAL_CHOICES,
  keyDropShuffle: true,
  deathLink: false,
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
