/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { DIFFICULTY_OPTION_DESCRIPTIONS } from './difficulty/difficulty-options.constants';
import { POND_OPTION_DESCRIPTIONS } from './pond/pond-option-descriptions.constants';
import { PROGRESSIVE_TIER_DESCRIPTIONS } from './progressive/progressive-options.constants';
import { PROGRESSIVE_MODE_DESCRIPTIONS } from './progressive/progressive-mode-options.constants';
import { RETRO_OPTION_DESCRIPTIONS } from './retro/retro-options';
import { SHOP_SLOT_DESCRIPTIONS } from './shops/shop-slot-options';
import type { OptionDescriptionSource } from './option-description.type';

const PLACEMENT = msg('randomizer-world:desc.placement');

const JUMPS = msg('randomizer-world:desc.jumps');

const BONUS = msg('randomizer-world:desc.bonus');
const BONUS_BASE = msg('randomizer-world:desc.bonusBase');

const OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescriptionSource>> = {
  ...SHOP_SLOT_DESCRIPTIONS,
  ...DIFFICULTY_OPTION_DESCRIPTIONS,
  ...PROGRESSIVE_TIER_DESCRIPTIONS,
  ...PROGRESSIVE_MODE_DESCRIPTIONS,
  ...RETRO_OPTION_DESCRIPTIONS,
  ...POND_OPTION_DESCRIPTIONS,

  include_npc_checks: msg('randomizer-world:desc.include_npc_checks'),
  include_world_items: msg('randomizer-world:desc.include_world_items'),
  dungeon_prize_shuffle: msg('randomizer-world:desc.dungeon_prize_shuffle'),
  accessibility: [
    { term: msg('randomizer-world:choice.full'), detail: msg('randomizer-world:detail.accessibility.full') },
    { term: msg('randomizer-world:choice.items'), detail: msg('randomizer-world:detail.accessibility.items') },
    { term: msg('randomizer-world:choice.minimal'), detail: msg('randomizer-world:detail.accessibility.minimal') },
  ],

  dark_room_light_required: [
    { term: msg('randomizer-world:choice.on'), detail: msg('randomizer-world:detail.darkRoom.on') },
    { term: msg('randomizer-world:choice.off'), detail: msg('randomizer-world:detail.darkRoom.off') },
  ],

  big_key_shuffle: PLACEMENT,
  small_key_shuffle: msg('randomizer-world:desc.small_key_shuffle'),
  key_drop_shuffle: msg('randomizer-world:desc.key_drop_shuffle'),
  compass_shuffle: PLACEMENT,
  map_shuffle: PLACEMENT,

  item_power_byrna_barrier: msg('randomizer-world:desc.item_power_byrna_barrier'),
  item_power_silver_arrows_anywhere: msg('randomizer-world:desc.item_power_silver_arrows_anywhere'),
  item_power_powder_fairy: msg('randomizer-world:desc.item_power_powder_fairy'),
  item_power_hammer_tablets: msg('randomizer-world:desc.item_power_hammer_tablets'),

  retro_bow: msg('randomizer-world:desc.retro_bow'),

  shop_item_slots: msg('randomizer-world:desc.shop_item_slots'),
  shop_slot_depth: msg('randomizer-world:desc.shop_slot_depth'),
  shop_price_arrows: msg('randomizer-world:desc.shop_price_arrows'),
  shop_price_hearts: msg('randomizer-world:desc.shop_price_hearts'),
  shop_price_hearts_max: msg('randomizer-world:desc.shop_price_hearts_max'),
  shop_price_bottle: msg('randomizer-world:desc.shop_price_bottle'),
  shop_price_modifier: msg('randomizer-world:desc.shop_price_modifier'),

  capacity_upgrades_enabled: msg('randomizer-world:desc.capacity_upgrades_enabled'),
  capacity_explosives_mode: msg('randomizer-world:desc.capacity_explosives_mode'),
  capacity_explosives_jumps: JUMPS,
  capacity_projectiles_mode: msg('randomizer-world:desc.capacity_projectiles_mode'),
  capacity_projectiles_jumps: JUMPS,
  capacity_meter_mode: msg('randomizer-world:desc.capacity_meter_mode'),
  capacity_wallet_jumps: msg('randomizer-world:desc.capacity_wallet_jumps'),
  capacity_progressive: msg('randomizer-world:desc.capacity_progressive'),
  capacity_explosives_bonus: BONUS,
  capacity_explosives_bonus_step: BONUS_BASE,
  capacity_projectiles_bonus: BONUS,
  capacity_projectiles_bonus_step: BONUS_BASE,
  capacity_meter_bonus: BONUS,
  capacity_meter_bonus_step: msg('randomizer-world:desc.capacity_meter_bonus_step'),
  capacity_wallet_bonus: BONUS,
  capacity_wallet_bonus_step: BONUS_BASE,

  plando_connections: msg('randomizer-world:desc.plando_connections'),
  start_inventory_from_pool: msg('randomizer-world:desc.start_inventory_from_pool'),
  goal: msg('randomizer-world:desc.goal'),
  mode: [
    { term: msg('randomizer-world:choice.standard'), detail: msg('randomizer-world:detail.mode.standard') },
    { term: msg('randomizer-world:choice.open'), detail: msg('randomizer-world:detail.mode.open') },
    { term: msg('randomizer-world:choice.inverted'), detail: msg('randomizer-world:detail.mode.inverted') },
  ],
  glitches_required: msg('randomizer-world:desc.glitches_required'),
  open_pyramid: msg('randomizer-world:desc.open_pyramid'),
  crystals_needed_for_gt: msg('randomizer-world:desc.crystals_needed_for_gt'),
  crystals_needed_for_ganon: msg('randomizer-world:desc.crystals_needed_for_ganon'),
  triforce_pieces_mode: msg('randomizer-world:desc.triforce_pieces_mode'),
  triforce_pieces_percentage: msg('randomizer-world:desc.triforce_pieces_percentage'),
  triforce_pieces_required: msg('randomizer-world:desc.triforce_pieces_required'),
  triforce_pieces_available: msg('randomizer-world:desc.triforce_pieces_available'),
  triforce_pieces_extra: msg('randomizer-world:desc.triforce_pieces_extra'),
  entrance_shuffle: msg('randomizer-world:desc.entrance_shuffle'),
  entrance_shuffle_seed: msg('randomizer-world:desc.entrance_shuffle_seed'),
  restrict_dungeon_item_on_boss: msg('randomizer-world:desc.restrict_dungeon_item_on_boss'),
  enemy_health: msg('randomizer-world:desc.enemy_health'),
  enemy_damage: msg('randomizer-world:desc.enemy_damage'),
  retro_caves: msg('randomizer-world:desc.retro_caves'),
  hints: msg('randomizer-world:desc.hints'),
  scams: msg('randomizer-world:desc.scams'),
  boss_shuffle: msg('randomizer-world:desc.boss_shuffle'),
  pot_shuffle: msg('randomizer-world:desc.pot_shuffle'),
  enemy_shuffle: msg('randomizer-world:desc.enemy_shuffle'),
  killable_thieves: msg('randomizer-world:desc.killable_thieves'),
  bush_shuffle: msg('randomizer-world:desc.bush_shuffle'),
  shuffle_prizes: msg('randomizer-world:desc.shuffle_prizes'),
  tile_shuffle: msg('randomizer-world:desc.tile_shuffle'),
  misery_mire_medallion: msg('randomizer-world:desc.misery_mire_medallion'),
  turtle_rock_medallion: msg('randomizer-world:desc.turtle_rock_medallion'),
  glitch_boots: msg('randomizer-world:desc.glitch_boots'),
  beemizer_total_chance: msg('randomizer-world:desc.beemizer_total_chance'),
  beemizer_trap_chance: msg('randomizer-world:desc.beemizer_trap_chance'),
  timer: msg('randomizer-world:desc.timer'),
  countdown_start_time: msg('randomizer-world:desc.countdown_start_time'),
  red_clock_time: msg('randomizer-world:desc.red_clock_time'),
  blue_clock_time: msg('randomizer-world:desc.blue_clock_time'),
  green_clock_time: msg('randomizer-world:desc.green_clock_time'),
  death_link: msg('randomizer-world:desc.death_link'),
  allow_collect: msg('randomizer-world:desc.allow_collect'),
};

export { OPTION_DESCRIPTIONS };
