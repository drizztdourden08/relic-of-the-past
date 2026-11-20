/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { CAPACITY_OPTION_SEEDS } from '../options-capacity/options-capacity.constants';
import { CAPACITY_BONUS_OPTION_SEEDS } from '../capacity/bonus/capacity-bonus-options.constants';
import { DIFFICULTY_OPTION_SEEDS } from '../difficulty/difficulty-options.constants';
import { ITEM_POWER_OPTION_SEEDS } from '../item-power/item-power-options.constants';
import { PROGRESSIVE_OPTION_SEEDS } from '../progressive/progressive-options.constants';
import { PROGRESSIVE_MODE_OPTION_SEEDS } from '../progressive/progressive-mode-options.constants';
import { RETRO_OPTION_SEEDS } from '../retro/retro-options';
import { POND_OPTION_SEEDS } from '../options-pond/options-pond.constants';
import { STANDARD_SHOP_SLOT_COUNT } from '../shops/shop-slot-facts';
import { SHOP_SLOT_DEPTH_SEED, SHOP_SLOT_OPTION_SEEDS } from '../shops/shop-slot-options';
import {
  SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
  SHOP_PRICE_OPTION_SEEDS,
} from '../shops/shop-price-options';
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
  lockedChoice({ key: 'enemy_health', displayName: msg('randomizer-world:option.enemy_health'), group: 'enemies', implementation: 'not-implemented' }, ENEMY_TIER_CHOICES, 'default'),
  lockedChoice({ key: 'enemy_damage', displayName: msg('randomizer-world:option.enemy_damage'), group: 'enemies', implementation: 'not-implemented' },
    optionChoices(['default', 0], ['shuffled', 2], ['chaos', 3]), 'default'),
  ...PROGRESSIVE_OPTION_SEEDS,
  ...PROGRESSIVE_MODE_OPTION_SEEDS,
  {
    key: 'retro_bow',
    displayName: msg('randomizer-world:option.retro_bow'),
    group: 'items',
    kind: 'toggle',
    implementation: 'active',
    sourceDefault: false,
    baseline: false,
    locked: false,
  },
  ...RETRO_OPTION_SEEDS,
  lockedToggle({ key: 'retro_caves', displayName: msg('randomizer-world:option.retro_caves'), group: 'world', implementation: 'vanilla-fixed' }),
  lockedChoice({ key: 'hints', displayName: msg('randomizer-world:option.hints'), group: 'other', implementation: 'not-implemented' },
    optionChoices(['off', 0], ['on', 2], ['full', 3]), 'on', 'off'),
  lockedChoice({ key: 'scams', displayName: msg('randomizer-world:option.scams'), group: 'shops', implementation: 'not-implemented' },
    optionChoices(['off', 0], ['king_zora', 1], ['bottle_merchant', 2], ['all', 3]), 'off'),
  lockedChoice({ key: 'boss_shuffle', displayName: msg('randomizer-world:option.boss_shuffle'), group: 'enemies', implementation: 'not-implemented' },
    optionChoices(['none', 0], ['basic', 1], ['full', 2], ['chaos', 3], ['singularity', 4]), 'none'),
  lockedToggle({ key: 'pot_shuffle', displayName: msg('randomizer-world:option.pot_shuffle'), group: 'enemies', implementation: 'not-implemented' }),
  lockedToggle({ key: 'enemy_shuffle', displayName: msg('randomizer-world:option.enemy_shuffle'), group: 'enemies', implementation: 'not-implemented' }),
  lockedToggle({ key: 'killable_thieves', displayName: msg('randomizer-world:option.killable_thieves'), group: 'enemies', implementation: 'not-implemented' }),
  lockedToggle({ key: 'bush_shuffle', displayName: msg('randomizer-world:option.bush_shuffle'), group: 'enemies', implementation: 'not-implemented' }),
  {
    key: 'shop_item_slots',
    displayName: msg('randomizer-world:option.shop_item_slots'),
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
  unlocked(lockedRange({ key: 'shop_price_modifier', displayName: msg('randomizer-world:option.shop_price_modifier'), group: 'shops', implementation: 'active' },
    { min: SHOP_PRICE_MODIFIER_MIN, max: SHOP_PRICE_MODIFIER_MAX }, SHOP_PRICE_MODIFIER_DEFAULT)),
  ...CAPACITY_OPTION_SEEDS,
  ...CAPACITY_BONUS_OPTION_SEEDS,
  ...POND_OPTION_SEEDS,
];

export { ITEM_OPTION_SEEDS };
