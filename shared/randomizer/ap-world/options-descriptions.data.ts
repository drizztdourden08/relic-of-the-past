/* @layer shared-game @kind data */
/**
 * The one-line clarifier a catalog row carries when its label alone does not
 * say what changes in play. A row whose label already says it has no entry
 * and renders with no description. Keyed by option key; options.data.ts
 * merges these into the catalog.
 *
 * The locked rows all carry one: their labels are the source project's own
 * field names, so a player has no way to know what "Beemizer" or "Scams" would
 * do. The line says what the setting means, and the row's own tag says why it
 * cannot be changed here.
 */

import { DIFFICULTY_OPTION_DESCRIPTIONS } from './difficulty/difficulty-options.data';
import { PROGRESSIVE_TIER_DESCRIPTIONS } from './progressive/progressive-options.data';
import { PROGRESSIVE_MODE_DESCRIPTIONS } from './progressive/progressive-mode-options.data';
import { RETRO_OPTION_DESCRIPTIONS } from './retro/retro-options.data';
import { SHOP_SLOT_DESCRIPTIONS } from './shops/shop-slot-options.data';
import type { OptionDescription, OptionDetail } from './option-description.type';

const line = (term: string, detail: string): OptionDetail => ({ term, detail });

/** The placement choices, and the two the generator cannot roll (dungeon-items/dungeon-item-modes.ts). */
const PLACEMENT = 'Own dungeons: any dungeon. Own world and Any world: anywhere. Different world and Start '
  + 'with roll as Original dungeon.';

const JUMPS = 'Comma separated steps adding up to the whole climb; read only with the Free sequence curve.';

const BONUS = 'Handed over with the upgrade, never past the new maximum; at 0 only the maximum rises.';
const BONUS_BASE = 'On, a share of what the upgrade added; off, of the new maximum.';

const AP_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = {
  ...SHOP_SLOT_DESCRIPTIONS,
  ...DIFFICULTY_OPTION_DESCRIPTIONS,
  ...PROGRESSIVE_TIER_DESCRIPTIONS,
  ...PROGRESSIVE_MODE_DESCRIPTIONS,
  ...RETRO_OPTION_DESCRIPTIONS,

  include_npc_checks: 'Rewards from characters, bosses and story events join the shuffle.',
  include_world_items: 'Ledge and island items, dig and dash prizes, the tablets, the pedestal and the keys '
    + 'standing on dungeon floors.',
  dungeon_prize_shuffle: 'Pendants and crystals move between dungeons.',
  accessibility: [
    line('Full', 'every location can be reached.'),
    line('Items', 'every item can be collected; some locations may stay shut.'),
    line('Minimal', 'only what finishing needs is guaranteed.'),
  ],

  dark_room_light_required: [
    line('On', 'a dark room counts as passable only with a ticked light.'),
    line('Off', 'dark rooms count as passable without one.'),
  ],

  big_key_shuffle: PLACEMENT,
  small_key_shuffle: 'Own dungeons: any dungeon. Own world and Any world: anywhere. Different world, Start '
    + 'with and Universal roll as Original dungeon.',
  key_drop_shuffle: 'Adds the keys enemies drop and the keys hidden under pots to the shuffle.',
  compass_shuffle: PLACEMENT,
  map_shuffle: PLACEMENT,

  item_power_byrna_barrier: 'The blue barrier makes you invulnerable while it is up.',
  item_power_silver_arrows_anywhere: 'Silver arrows do full damage to every enemy, not only the final boss.',
  item_power_powder_fairy: 'Magic powder can turn an enemy into a fairy.',
  item_power_hammer_tablets: 'The hammer can read the tablets in place of a sword.',

  retro_bow: 'Arrows are no longer found or carried; every shot costs rupees.',

  shop_item_slots: 'How many of the ticked slots hold a shuffled item; read by Sequential and Random only.',
  shop_slot_depth: 'Above one, a slot restocks with another shuffled item after each purchase.',
  shop_price_arrows: 'Off while retro bow is on.',
  shop_price_hearts: 'Paying costs health on the spot; the range stops one heart under the heart ceiling on '
    + 'the Items tab.',
  shop_price_hearts_max: 'Stops one heart under the heart ceiling on the Items tab.',
  shop_price_bottle: 'The shelf takes what is in the bottle and hands the empty bottle back.',
  shop_price_modifier: 'Scales every rolled price by this percentage; a price still never passes what you '
    + 'can hold.',

  capacity_upgrades_enabled: 'Off: no capacity changes, and the pond sells its upgrades as usual.',
  capacity_explosives_mode: 'Vanilla in pool: the upgrades become items to find anywhere, and the pond '
    + 'becomes a check.',
  capacity_explosives_jumps: JUMPS,
  capacity_projectiles_mode: 'Vanilla in pool: the upgrades become items to find anywhere, and the pond '
    + 'becomes a check.',
  capacity_projectiles_jumps: JUMPS,
  capacity_meter_mode: 'An upgrade lowers what each use costs; the bar never grows. Vanilla in pool: the '
    + 'upgrade becomes an item to find, and its spot a check.',
  capacity_wallet_jumps: 'Comma separated steps in hundreds of rupees adding up to the whole climb; read '
    + 'only with the Free sequence curve.',
  capacity_progressive: 'On, upgrades climb the ladder in the order found; off, each carries a fixed step '
    + 'and can be found in any order.',
  capacity_explosives_bonus: BONUS,
  capacity_explosives_bonus_step: BONUS_BASE,
  capacity_projectiles_bonus: BONUS,
  capacity_projectiles_bonus_step: BONUS_BASE,
  capacity_meter_bonus: BONUS,
  capacity_meter_bonus_step: 'On, a share of what the upgrade added to the bar, which is nothing past the '
    + 'empty tier; off, of the full bar.',
  capacity_wallet_bonus: BONUS,
  capacity_wallet_bonus_step: BONUS_BASE,

  pond_mode: [
    line('Vanilla cost', 'the same throws and prices, but the first few hand over a shuffled item.'),
    line('Gamble', 'rising prices; some throws win a shuffled item, the rest refund half.'),
  ],
  pond_items: 'Zero leaves the pond out of the shuffle.',
  pond_jumps: JUMPS,

  // ─── Locked rows: what the setting would do ───
  plando_connections: 'Hand-written entrance connections, set before the seed rolls.',
  start_inventory_from_pool: 'Items you begin with are taken out of the pool instead of added to it.',
  goal: 'What ends the seed and what it asks of you first.',
  mode: [
    line('Standard', 'the seed opens with the rescue.'),
    line('Open', 'you start free, with the castle already behind you.'),
    line('Inverted', 'the two worlds swap: you begin in the dark one.'),
  ],
  glitches_required: 'How much trick knowledge the seed may expect before it calls something reachable.',
  open_pyramid: 'Whether the hole in the pyramid is open before you earn your way in.',
  crystals_needed_for_gt: 'Fewer crystals means a shorter seed.',
  crystals_needed_for_ganon: 'Fewer crystals means a shorter ending.',
  triforce_pieces_mode: 'How the number of pieces to collect is decided.',
  triforce_pieces_percentage: 'Pieces placed, as a percentage of the number you must collect.',
  triforce_pieces_required: 'How many pieces you must collect to finish.',
  triforce_pieces_available: 'How many pieces exist in the seed.',
  triforce_pieces_extra: 'Pieces placed beyond the number you must collect.',
  entrance_shuffle: 'Where the doorways lead, from dungeon doors alone up to every door in both worlds.',
  entrance_shuffle_seed: 'The seed the doorway shuffle is drawn from.',
  restrict_dungeon_item_on_boss: 'Keeps the map, compass and keys of a dungeon off its own boss.',
  enemy_health: 'How much punishment enemies take.',
  enemy_damage: 'How hard enemies hit.',
  retro_caves: 'Adds the extra caves and the old-style take-any choices to the world.',
  hints: 'Whether telepathic tiles and stones tell you where things are.',
  scams: 'Whether the merchants who sell you something unseen can lie about what it is.',
  boss_shuffle: 'Which boss stands at the end of which dungeon.',
  pot_shuffle: 'Shuffles what is hidden under the pots.',
  enemy_shuffle: 'Which enemy stands where.',
  killable_thieves: 'Lets the thieves that normally shrug off every hit be killed.',
  bush_shuffle: 'Shuffles what a pulled bush hides.',
  shuffle_prizes: 'Shuffles the drops enemies leave and what falls from a bonked tree.',
  tile_shuffle: 'Shuffles the rooms whose floor tiles fly at you.',
  misery_mire_medallion: 'The medallion that opens this dungeon.',
  turtle_rock_medallion: 'The medallion that opens this dungeon.',
  glitch_boots: 'Starts you with the boots when the glitch setting needs them.',
  beemizer_total_chance: 'How often a filler pickup becomes bees instead.',
  beemizer_trap_chance: 'How often those bees are the hostile kind.',
  timer: 'Playing against a clock, counting up or down, or a race a single hit ends.',
  countdown_start_time: 'Minutes on the clock when a countdown starts.',
  red_clock_time: 'Minutes a red clock adds or takes away.',
  blue_clock_time: 'Minutes a blue clock adds or takes away.',
  green_clock_time: 'Minutes a green clock adds or takes away.',
  death_link: 'Dying sends everyone else in the session to their death too.',
  allow_collect: 'Lets a check holding an item for someone else open itself when they collect it.',
};

export { AP_OPTION_DESCRIPTIONS };
