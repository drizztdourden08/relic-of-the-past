/* @layer shared-game @kind constants */
import { CAPACITY_OPTION_SEEDS } from '../options-capacity/options-capacity.constants';
import { CAPACITY_BONUS_OPTION_SEEDS } from '../capacity/bonus/capacity-bonus-options.constants';
import { DIFFICULTY_OPTION_SEEDS } from '../difficulty/difficulty-options.constants';
import { ITEM_POWER_OPTION_SEEDS } from '../item-power/item-power-options.data';
import { PROGRESSIVE_OPTION_SEEDS } from '../progressive/progressive-options.constants';
import { PROGRESSIVE_MODE_OPTION_SEEDS } from '../progressive/progressive-mode-options.constants';
import { RETRO_OPTION_SEEDS } from '../retro/retro-options.data';
import { POND_OPTION_SEEDS } from '../options-pond/options-pond.constants';
import { STANDARD_SHOP_SLOT_COUNT } from '../shops/shop-slot-facts';
import { SHOP_SLOT_DEPTH_SEED, SHOP_SLOT_OPTION_SEEDS } from '../shops/shop-slot-options.data';
import {
  SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
  SHOP_PRICE_OPTION_SEEDS,
} from '../shops/shop-price-options.data';
import { ENEMY_TIER_CHOICES } from './option-choice-sets.constants';
import { optionChoices } from './option-choices';
import { lockedChoice } from './locked-choice';
import { lockedRange } from './locked-range';
import { lockedToggle } from './locked-toggle';
import { unlocked } from './unlocked';
import type { OptionSeed } from '../options.type';

const ITEM_OPTION_SEEDS: readonly OptionSeed[] = [
  ...DIFFICULTY_OPTION_SEEDS,
  ...ITEM_POWER_OPTION_SEEDS,
  lockedChoice('enemy_health', 'Enemy Health', 'enemies', 'not-implemented', ENEMY_TIER_CHOICES, 'default'),
  lockedChoice('enemy_damage', 'Enemy Damage', 'enemies', 'not-implemented',
    optionChoices(['default', 0], ['shuffled', 2], ['chaos', 3]), 'default'),
  ...PROGRESSIVE_OPTION_SEEDS,
  ...PROGRESSIVE_MODE_OPTION_SEEDS,
  {
    key: 'retro_bow',
    displayName: 'Retro Bow',
    group: 'items',
    kind: 'toggle',
    implementation: 'active',
    sourceDefault: false,
    baseline: false,
    locked: false,
  },
  ...RETRO_OPTION_SEEDS,
  lockedToggle('retro_caves', 'Retro Caves', 'world', 'vanilla-fixed'),
  lockedChoice('hints', 'Hints', 'other', 'not-implemented',
    optionChoices(['off', 0], ['on', 2], ['full', 3]), 'on', 'off'),
  lockedChoice('scams', 'Scams', 'shops', 'not-implemented',
    optionChoices(['off', 0], ['king_zora', 1], ['bottle_merchant', 2], ['all', 3]), 'off'),
  lockedChoice('boss_shuffle', 'Boss Shuffle', 'enemies', 'not-implemented',
    optionChoices(['none', 0], ['basic', 1], ['full', 2], ['chaos', 3], ['singularity', 4]), 'none'),
  lockedToggle('pot_shuffle', 'Pot Shuffle', 'enemies', 'not-implemented'),
  lockedToggle('enemy_shuffle', 'Enemy Shuffle', 'enemies', 'not-implemented'),
  lockedToggle('killable_thieves', 'Killable Thieves', 'enemies', 'not-implemented'),
  lockedToggle('bush_shuffle', 'Bush Shuffle', 'enemies', 'not-implemented'),
  {
    key: 'shop_item_slots',
    displayName: 'Available Shop Slots',
    group: 'shops',
    kind: 'range',
    implementation: 'active',
    range: { min: 0, max: STANDARD_SHOP_SLOT_COUNT },
    sourceDefault: 0,
    baseline: 0,
    locked: false,
  },
  SHOP_SLOT_DEPTH_SEED,
  ...SHOP_SLOT_OPTION_SEEDS,
  ...SHOP_PRICE_OPTION_SEEDS,
  unlocked(lockedRange('shop_price_modifier', 'Shop Price Modifier', 'shops', 'active',
    SHOP_PRICE_MODIFIER_MIN, SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_DEFAULT)),
  ...CAPACITY_OPTION_SEEDS,
  ...CAPACITY_BONUS_OPTION_SEEDS,
  ...POND_OPTION_SEEDS,
];

export { ITEM_OPTION_SEEDS };
