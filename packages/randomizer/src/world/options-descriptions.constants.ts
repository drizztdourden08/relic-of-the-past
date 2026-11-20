/* @layer shared-game @kind data */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { DIFFICULTY_OPTION_DESCRIPTIONS } from './difficulty/difficulty-options.constants';
import { POND_OPTION_DESCRIPTIONS } from './pond/pond-option-descriptions.constants';
import { PROGRESSIVE_TIER_DESCRIPTIONS } from './progressive/progressive-options.constants';
import { PROGRESSIVE_MODE_DESCRIPTIONS } from './progressive/progressive-mode-options.constants';
import { RETRO_OPTION_DESCRIPTIONS } from './retro/retro-options';
import { SHOP_SLOT_DESCRIPTIONS } from './shops/shop-slot-options';
import type { OptionDescriptionSource } from './option-description.type';

const PLACEMENT: Message = { key: 'randomizer-world:desc.placement' };

const JUMPS: Message = { key: 'randomizer-world:desc.jumps' };

const BONUS: Message = { key: 'randomizer-world:desc.bonus' };
const BONUS_BASE: Message = { key: 'randomizer-world:desc.bonusBase' };

const OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescriptionSource>> = {
  ...SHOP_SLOT_DESCRIPTIONS,
  ...DIFFICULTY_OPTION_DESCRIPTIONS,
  ...PROGRESSIVE_TIER_DESCRIPTIONS,
  ...PROGRESSIVE_MODE_DESCRIPTIONS,
  ...RETRO_OPTION_DESCRIPTIONS,
  ...POND_OPTION_DESCRIPTIONS,

  include_npc_checks: { key: 'randomizer-world:desc.include_npc_checks' },
  include_world_items: { key: 'randomizer-world:desc.include_world_items' },
  dungeon_prize_shuffle: { key: 'randomizer-world:desc.dungeon_prize_shuffle' },
  accessibility: [
    { term: { key: 'randomizer-world:choice.full' }, detail: { key: 'randomizer-world:detail.accessibility.full' } },
    { term: { key: 'randomizer-world:choice.items' }, detail: { key: 'randomizer-world:detail.accessibility.items' } },
    { term: { key: 'randomizer-world:choice.minimal' }, detail: { key: 'randomizer-world:detail.accessibility.minimal' } },
  ],

  dark_room_light_required: [
    { term: { key: 'randomizer-world:choice.on' }, detail: { key: 'randomizer-world:detail.darkRoom.on' } },
    { term: { key: 'randomizer-world:choice.off' }, detail: { key: 'randomizer-world:detail.darkRoom.off' } },
  ],

  big_key_shuffle: PLACEMENT,
  small_key_shuffle: { key: 'randomizer-world:desc.small_key_shuffle' },
  key_drop_shuffle: { key: 'randomizer-world:desc.key_drop_shuffle' },
  compass_shuffle: PLACEMENT,
  map_shuffle: PLACEMENT,

  item_power_byrna_barrier: { key: 'randomizer-world:desc.item_power_byrna_barrier' },
  item_power_silver_arrows_anywhere: { key: 'randomizer-world:desc.item_power_silver_arrows_anywhere' },
  item_power_powder_fairy: { key: 'randomizer-world:desc.item_power_powder_fairy' },
  item_power_hammer_tablets: { key: 'randomizer-world:desc.item_power_hammer_tablets' },

  retro_bow: { key: 'randomizer-world:desc.retro_bow' },

  shop_item_slots: { key: 'randomizer-world:desc.shop_item_slots' },
  shop_slot_depth: { key: 'randomizer-world:desc.shop_slot_depth' },
  shop_price_arrows: { key: 'randomizer-world:desc.shop_price_arrows' },
  shop_price_hearts: { key: 'randomizer-world:desc.shop_price_hearts' },
  shop_price_hearts_max: { key: 'randomizer-world:desc.shop_price_hearts_max' },
  shop_price_bottle: { key: 'randomizer-world:desc.shop_price_bottle' },
  shop_price_modifier: { key: 'randomizer-world:desc.shop_price_modifier' },

  capacity_upgrades_enabled: { key: 'randomizer-world:desc.capacity_upgrades_enabled' },
  capacity_explosives_mode: { key: 'randomizer-world:desc.capacity_explosives_mode' },
  capacity_explosives_jumps: JUMPS,
  capacity_projectiles_mode: { key: 'randomizer-world:desc.capacity_projectiles_mode' },
  capacity_projectiles_jumps: JUMPS,
  capacity_meter_mode: { key: 'randomizer-world:desc.capacity_meter_mode' },
  capacity_wallet_jumps: { key: 'randomizer-world:desc.capacity_wallet_jumps' },
  capacity_progressive: { key: 'randomizer-world:desc.capacity_progressive' },
  capacity_explosives_bonus: BONUS,
  capacity_explosives_bonus_step: BONUS_BASE,
  capacity_projectiles_bonus: BONUS,
  capacity_projectiles_bonus_step: BONUS_BASE,
  capacity_meter_bonus: BONUS,
  capacity_meter_bonus_step: { key: 'randomizer-world:desc.capacity_meter_bonus_step' },
  capacity_wallet_bonus: BONUS,
  capacity_wallet_bonus_step: BONUS_BASE,

  plando_connections: { key: 'randomizer-world:desc.plando_connections' },
  start_inventory_from_pool: { key: 'randomizer-world:desc.start_inventory_from_pool' },
  goal: { key: 'randomizer-world:desc.goal' },
  mode: [
    { term: { key: 'randomizer-world:choice.standard' }, detail: { key: 'randomizer-world:detail.mode.standard' } },
    { term: { key: 'randomizer-world:choice.open' }, detail: { key: 'randomizer-world:detail.mode.open' } },
    { term: { key: 'randomizer-world:choice.inverted' }, detail: { key: 'randomizer-world:detail.mode.inverted' } },
  ],
  glitches_required: { key: 'randomizer-world:desc.glitches_required' },
  open_pyramid: { key: 'randomizer-world:desc.open_pyramid' },
  crystals_needed_for_gt: { key: 'randomizer-world:desc.crystals_needed_for_gt' },
  crystals_needed_for_ganon: { key: 'randomizer-world:desc.crystals_needed_for_ganon' },
  triforce_pieces_mode: { key: 'randomizer-world:desc.triforce_pieces_mode' },
  triforce_pieces_percentage: { key: 'randomizer-world:desc.triforce_pieces_percentage' },
  triforce_pieces_required: { key: 'randomizer-world:desc.triforce_pieces_required' },
  triforce_pieces_available: { key: 'randomizer-world:desc.triforce_pieces_available' },
  triforce_pieces_extra: { key: 'randomizer-world:desc.triforce_pieces_extra' },
  entrance_shuffle: { key: 'randomizer-world:desc.entrance_shuffle' },
  entrance_shuffle_seed: { key: 'randomizer-world:desc.entrance_shuffle_seed' },
  restrict_dungeon_item_on_boss: { key: 'randomizer-world:desc.restrict_dungeon_item_on_boss' },
  enemy_health: { key: 'randomizer-world:desc.enemy_health' },
  enemy_damage: { key: 'randomizer-world:desc.enemy_damage' },
  retro_caves: { key: 'randomizer-world:desc.retro_caves' },
  hints: { key: 'randomizer-world:desc.hints' },
  scams: { key: 'randomizer-world:desc.scams' },
  boss_shuffle: { key: 'randomizer-world:desc.boss_shuffle' },
  pot_shuffle: { key: 'randomizer-world:desc.pot_shuffle' },
  enemy_shuffle: { key: 'randomizer-world:desc.enemy_shuffle' },
  killable_thieves: { key: 'randomizer-world:desc.killable_thieves' },
  bush_shuffle: { key: 'randomizer-world:desc.bush_shuffle' },
  shuffle_prizes: { key: 'randomizer-world:desc.shuffle_prizes' },
  tile_shuffle: { key: 'randomizer-world:desc.tile_shuffle' },
  misery_mire_medallion: { key: 'randomizer-world:desc.misery_mire_medallion' },
  turtle_rock_medallion: { key: 'randomizer-world:desc.turtle_rock_medallion' },
  glitch_boots: { key: 'randomizer-world:desc.glitch_boots' },
  beemizer_total_chance: { key: 'randomizer-world:desc.beemizer_total_chance' },
  beemizer_trap_chance: { key: 'randomizer-world:desc.beemizer_trap_chance' },
  timer: { key: 'randomizer-world:desc.timer' },
  countdown_start_time: { key: 'randomizer-world:desc.countdown_start_time' },
  red_clock_time: { key: 'randomizer-world:desc.red_clock_time' },
  blue_clock_time: { key: 'randomizer-world:desc.blue_clock_time' },
  green_clock_time: { key: 'randomizer-world:desc.green_clock_time' },
  death_link: { key: 'randomizer-world:desc.death_link' },
  allow_collect: { key: 'randomizer-world:desc.allow_collect' },
};

export { OPTION_DESCRIPTIONS };
