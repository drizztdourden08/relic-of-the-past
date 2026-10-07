/* @layer shared-game @kind data */
/**
 * Full option catalog transcribed from Archipelago worlds/alttp/Options.py,
 * every option of the reference project's ALTTPOptions dataclass that is a
 * question about the SEED, in dataclass order, with the source default
 * (apDefault), the value this app hard-sets
 * (baseline), and an audited `implementation` class stating what the engine
 * really does with it. Baselines of 'not-implemented' options are their
 * off/vanilla value, so a frozen snapshot never advertises a feature the
 * engine lacks. The reference's display and quality-of-life block (palettes,
 * heart colour and beep, menu speed, quickswap, music, reduced flashing, the
 * two HUD readouts) is deliberately absent: those are settings this app
 * already owns per profile, and a seed option screen is not where a player
 * should look for them. Absent for a second reason: the rows this app now asks
 * under a control of its own. A question offered twice is a duplicate, so the
 * source's bundled spelling of it is deleted instead of kept as a signpost:
 * the guard test lists them and proves each really is in the dataclass and
 * really is out of the catalog. Two rows are gone for a plainer reason: the
 * per-family order controls answer the tier-order question, and this app has
 * no surface at all for hand-written game text. All entries are locked except key_drop_shuffle, the four
 * dungeon-item placement rows, the three
 * synthetic switches at the top (two scope, one dungeon-prize) and the 22 synthetic capacity rows
 * (options-capacity.data.ts) that replace the reference's single capacity
 * toggle, which stays locked off. Descriptions merge in from
 * options-descriptions.data.ts. A synthetic row has no source default, so its
 * apDefault is its baseline; the baselines of the unlocked rows are what a
 * NEW profile starts from, and a stored snapshot missing one of them reads
 * the value it meant before the row existed (options-snapshot.ts).
 */
import { AP_OPTION_DESCRIPTIONS } from './options-descriptions.data';
import { detailsOf, plainTextOf } from './option-description';
import { CAPACITY_OPTION_SEEDS } from './options-capacity.data';
import { CAPACITY_BONUS_OPTION_SEEDS } from './capacity/bonus/capacity-bonus-options.data';
import { DARK_ROOM_OPTION_SEEDS } from './dark-rooms/dark-room-options.data';
import { DIFFICULTY_OPTION_SEEDS } from './difficulty/difficulty-options.data';
import { ITEM_POWER_OPTION_SEEDS } from './item-power/item-power-options.data';
import { PROGRESSIVE_OPTION_SEEDS } from './progressive/progressive-options.data';
import { PROGRESSIVE_MODE_OPTION_SEEDS } from './progressive/progressive-mode-options.data';
import { RETRO_OPTION_SEEDS } from './retro/retro-options.data';
import { POND_OPTION_SEEDS } from './options-pond.data';
import { STANDARD_SHOP_SLOT_COUNT } from './shops/shops.data';
import { SHOP_SLOT_DEPTH_SEED, SHOP_SLOT_OPTION_SEEDS } from './shops/shop-slot-options.data';
import {
  SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
  SHOP_PRICE_OPTION_SEEDS,
} from './shops/shop-price-options.data';
import type {
  ApOptionChoice, ApOptionDef, ApOptionGroup, ApOptionImplementation, ApOptionValue,
} from './options.type';

const humanize = (key: string): string =>
  key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const choice = (value: string, apValue: number | string, label?: string): ApOptionChoice => ({
  value,
  apValue,
  label: label ?? humanize(value),
});

const choices = (...values: Array<[string, number | string] | [string, number | string, string]>) =>
  values.map(([value, apValue, label]) => choice(value, apValue, label));

const AP_OPTION_GROUPS: readonly ApOptionGroup[] = [
  { id: 'scope', label: 'App Scope' },
  { id: 'world', label: 'World' },
  { id: 'goal', label: 'Goal' },
  { id: 'dungeon-items', label: 'Dungeon Items' },
  { id: 'items', label: 'Items' },
  { id: 'shops', label: 'Shops' },
  { id: 'enemies', label: 'Enemies' },
  { id: 'timers', label: 'Timers' },
  { id: 'session', label: 'Shared session' },
  { id: 'other', label: 'Other' },
];

const ENEMY_TIER = choices(['easy', 0], ['default', 1], ['hard', 2], ['expert', 3]);
const DUNGEON_ITEM = choices(
  ['original_dungeon', 0], ['own_dungeons', 1], ['own_world', 2],
  ['any_world', 3], ['different_world', 4], ['start_with', 6],
);
const SMALL_KEY = choices(
  ['original_dungeon', 0], ['own_dungeons', 1], ['own_world', 2],
  ['any_world', 3], ['different_world', 4], ['universal', 5], ['start_with', 6],
);
const MEDALLION = choices(['random', 'random'], ['ether', 0], ['bombos', 1], ['quake', 2]);

/**
 * The two rows that name which medallion a sealed entrance asks for. Named
 * once here, beside the catalog that defines them, so a consumer claims the
 * pair by reference instead of respelling their keys.
 */
const MEDALLION_OPTION_KEYS: readonly string[] = ['misery_mire_medallion', 'turtle_rock_medallion'];

type Group = ApOptionDef['group'];
type Impl = ApOptionImplementation;
/** Catalog entry before the description merge at the bottom of this file. */
type Seed = Omit<ApOptionDef, 'description'>;

const lockedToggle = (
  key: string, displayName: string, group: Group, implementation: Impl,
  apDefault = false, baseline = apDefault,
): Seed =>
  ({ key, displayName, group, kind: 'toggle', implementation, apDefault, baseline, locked: true });

const lockedRange = (
  key: string, displayName: string, group: Group, implementation: Impl,
  min: number, max: number, apDefault: number, baseline: number = apDefault,
): Seed =>
  ({ key, displayName, group, kind: 'range', implementation, range: { min, max }, apDefault, baseline, locked: true });

const lockedChoice = (
  key: string, displayName: string, group: Group, implementation: Impl,
  options: readonly ApOptionChoice[], apDefault: string, baseline: string = apDefault,
): Seed =>
  ({ key, displayName, group, kind: 'choice', implementation, choices: options, apDefault, baseline, locked: true });

const lockedText = (key: string, displayName: string, group: Group, implementation: Impl, apDefault: string): Seed =>
  ({ key, displayName, group, kind: 'text', implementation, apDefault, baseline: apDefault, locked: true });

/** A source row the player decides, under the key the source itself uses. */
const unlocked = (seed: Seed): Seed => ({ ...seed, locked: false });

const seeds: readonly Seed[] = [
  {
    key: 'include_npc_checks',
    displayName: 'Include NPC and event checks',
    group: 'scope',
    kind: 'toggle',
    implementation: 'active',
    apDefault: true,
    baseline: true,
    locked: false,
    synthetic: true,
  },
  {
    key: 'include_world_items',
    displayName: 'Include standing world items',
    group: 'scope',
    kind: 'toggle',
    implementation: 'active',
    apDefault: true,
    baseline: true,
    locked: false,
    synthetic: true,
  },
  {
    // Not a reference option: the reference always shuffles the ten dungeon rewards among
    // the ten reward slots (Rules.py 204-211 restricts those slots to reward items), with
    // no switch. This app needs the switch, because a placement generated before the core
    // could substitute a boss reward must keep playing as it was generated. The
    // reference's own `shuffle_prizes` is a different feature entirely: the enemy,
    // tree-pull and bonk DROP packs, and stays locked below.
    key: 'dungeon_prize_shuffle',
    displayName: 'Shuffle Dungeon Prizes',
    group: 'dungeon-items',
    kind: 'toggle',
    implementation: 'active',
    apDefault: true,
    baseline: true,
    locked: false,
    synthetic: true,
  },
  // ALTTPOptions dataclass, in field order.
  // The three contracts are all enforced: the fill relaxes for minimal, the
  // reference's self-locking allowances exist for anything but full, and the
  // post-fill sweep asks the question the chosen mode asks (accessibility/).
  // The baseline stays `full`, so every stored placement keeps its meaning.
  unlocked(lockedChoice('accessibility', 'Accessibility',
    'world', 'active', choices(['full', 0], ['items', 1], ['minimal', 2]), 'items', 'full')),
  lockedText('plando_connections', 'Plando Connections', 'other', 'not-implemented', ''),
  // An ITEMS question wherever the reference files it: what the player already
  // holds when the game begins, and what the pool therefore stops holding. It
  // sits on the items tab for that reason (option-tab-keys.ts ITEM_KEYS).
  lockedText('start_inventory_from_pool', 'Starting inventory', 'items', 'not-implemented', ''),
  lockedChoice('goal', 'Goal', 'goal', 'active', choices(
    ['ganon', 0], ['crystals', 1], ['bosses', 2], ['pedestal', 3], ['ganon_pedestal', 4],
    ['triforce_hunt', 5], ['local_triforce_hunt', 6], ['ganon_triforce_hunt', 7],
    ['local_ganon_triforce_hunt', 8],
  ), 'ganon'),
  // Baseline diverges from the source default: this app always plays the
  // vanilla intro (the escape sequence), which is the source's standard mode.
  lockedChoice('mode', 'Mode', 'world', 'active',
    choices(['standard', 0], ['open', 1], ['inverted', 2]), 'open', 'standard'),
  lockedChoice('glitches_required', 'Glitches Required', 'world', 'active', choices(
    ['no_glitches', 0], ['minor_glitches', 1], ['overworld_glitches', 2],
    ['hybrid_major_glitches', 3], ['no_logic', 4],
  ), 'no_glitches'),
  // The source asks the dark-room requirement as one three-way choice; this app
  // asks the two questions inside it apart, as rows the player owns
  // (dark-rooms/), so the source's own row is gone instead of duplicated.
  ...DARK_ROOM_OPTION_SEEDS,
  lockedChoice('open_pyramid', 'Open Pyramid Hole', 'world', 'vanilla-fixed',
    choices(['closed', 0], ['open', 1], ['goal', 2], ['auto', 3]), 'goal'),
  lockedRange('crystals_needed_for_gt', 'Crystals to enter the dark tower', 'goal', 'active', 0, 7, 7),
  lockedRange('crystals_needed_for_ganon', 'Crystals to hurt the final boss', 'goal', 'active', 0, 7, 7),
  lockedChoice('triforce_pieces_mode', 'Triforce Pieces Mode', 'goal', 'not-implemented',
    choices(['extra', 0], ['percentage', 1], ['available', 2]), 'available'),
  lockedRange('triforce_pieces_percentage', 'Triforce Pieces Percentage', 'goal', 'not-implemented', 100, 1000, 150),
  lockedRange('triforce_pieces_required', 'Triforce Pieces Required', 'goal', 'not-implemented', 1, 90, 20),
  lockedRange('triforce_pieces_available', 'Triforce Pieces Available', 'goal', 'not-implemented', 1, 90, 30),
  lockedRange('triforce_pieces_extra', 'Triforce Pieces Extra', 'goal', 'not-implemented', 0, 89, 10),
  lockedChoice('entrance_shuffle', 'Entrance Shuffle', 'world', 'active', choices(
    ['vanilla', 0], ['dungeons_simple', 1], ['dungeons_full', 2], ['dungeons_crossed', 3],
    ['simple', 4], ['restricted', 5], ['full', 6], ['crossed', 7], ['insanity', 8],
  ), 'vanilla'),
  lockedText('entrance_shuffle_seed', 'Entrance Shuffle Seed', 'world', 'not-implemented', 'random'),
  unlocked(lockedChoice('big_key_shuffle', 'Big Key Shuffle', 'dungeon-items', 'active', DUNGEON_ITEM, 'original_dungeon')),
  unlocked(lockedChoice('small_key_shuffle', 'Small Key Shuffle', 'dungeon-items', 'active', SMALL_KEY, 'original_dungeon')),
  {
    key: 'key_drop_shuffle',
    displayName: 'Key Drop Shuffle',
    group: 'dungeon-items',
    kind: 'toggle',
    implementation: 'active',
    apDefault: true,
    baseline: true,
    locked: false,
  },
  unlocked(lockedChoice('compass_shuffle', 'Compass Shuffle', 'dungeon-items', 'active', DUNGEON_ITEM, 'original_dungeon')),
  unlocked(lockedChoice('map_shuffle', 'Map Shuffle', 'dungeon-items', 'active', DUNGEON_ITEM, 'original_dungeon')),
  lockedToggle('restrict_dungeon_item_on_boss', 'Prevent Dungeon Item on Boss', 'dungeon-items', 'vanilla-fixed'),
  // The source bundles two unrelated questions into one four-step pool choice:
  // its generous step DUPLICATES a family's copies while its mean steps lower
  // the ceiling. Both are asked apart here: the copies as a multiple per
  // family and the hearts as their own ceiling (difficulty/), with which rungs
  // exist already answered by the tier ticks, so the bundled row is gone
  // instead of duplicated.
  ...DIFFICULTY_OPTION_SEEDS,
  // The source bundles several unrelated switches into one four-step choice;
  // this app asks them apart, as rows the player owns (item-power/), so the
  // source's own bundled row is gone instead of duplicated.
  ...ITEM_POWER_OPTION_SEEDS,
  lockedChoice('enemy_health', 'Enemy Health', 'enemies', 'not-implemented', ENEMY_TIER, 'default'),
  lockedChoice('enemy_damage', 'Enemy Damage', 'enemies', 'not-implemented',
    choices(['default', 0], ['shuffled', 2], ['chaos', 3]), 'default'),
  // The source asks the blade family as one toggle; this app asks it per rung
  // (progressive/), and unticking every blade rung IS that setting, so the
  // source's own row is gone instead of duplicated.
  ...PROGRESSIVE_OPTION_SEEDS,
  // The reference asks the whole seed one question about tier order; this app
  // asks it per family (progressive/progressive-mode-options.data.ts), which
  // its single row cannot express, so the rows live beside the ticks instead.
  ...PROGRESSIVE_MODE_OPTION_SEEDS,
  {
    // Live now: arrows leave the world entirely and the bow is fed rupees as it
    // fires (retro/). The two per-shot costs are the app's own rows below,
    // because the reference fixes them in its patcher and a cost is a number a
    // player should be able to move; the quiver's own price is its constant.
    key: 'retro_bow',
    displayName: 'Retro Bow',
    group: 'items',
    kind: 'toggle',
    implementation: 'active',
    apDefault: false,
    baseline: false,
    locked: false,
  },
  ...RETRO_OPTION_SEEDS,
  lockedToggle('retro_caves', 'Retro Caves', 'world', 'vanilla-fixed'),
  lockedChoice('hints', 'Hints', 'other', 'not-implemented',
    choices(['off', 0], ['on', 2], ['full', 3]), 'on', 'off'),
  // A question about what a merchant tells you before you pay, so it belongs
  // with the shops however the reference files it (option-tab-keys.ts SHOP_KEYS).
  lockedChoice('scams', 'Scams', 'shops', 'not-implemented',
    choices(['off', 0], ['king_zora', 1], ['bottle_merchant', 2], ['all', 3]), 'off'),
  lockedChoice('boss_shuffle', 'Boss Shuffle', 'enemies', 'not-implemented',
    choices(['none', 0], ['basic', 1], ['full', 2], ['chaos', 3], ['singularity', 4]), 'none'),
  lockedToggle('pot_shuffle', 'Pot Shuffle', 'enemies', 'not-implemented'),
  lockedToggle('enemy_shuffle', 'Enemy Shuffle', 'enemies', 'not-implemented'),
  lockedToggle('killable_thieves', 'Killable Thieves', 'enemies', 'not-implemented'),
  lockedToggle('bush_shuffle', 'Bush Shuffle', 'enemies', 'not-implemented'),
  // How many of the TICKED slots a counted mode opens. The source's own range
  // stops at 30 because it counts ten shelf shops of three; this app also
  // offers the potion seller's three cauldrons and the bomb counter's one
  // purchase, so the ceiling here is the whole canonical list. The control
  // itself never offers more than the player has ticked, since the panel takes its
  // maximum from the ticked set (shops/shop-scope.ts), never from this number.
  {
    key: 'shop_item_slots',
    displayName: 'Available Shop Slots',
    group: 'shops',
    kind: 'range',
    implementation: 'active',
    range: { min: 0, max: STANDARD_SHOP_SLOT_COUNT },
    apDefault: 0,
    baseline: 0,
    locked: false,
  },
  SHOP_SLOT_DEPTH_SEED,
  ...SHOP_SLOT_OPTION_SEEDS,
  ...SHOP_PRICE_OPTION_SEEDS,
  // Live now: the percentage every rolled price is scaled by before it is
  // clamped to what the profile can ever pay (shops/shop-price-plan.ts). The
  // reference's own range and its own reading, where a hundred changes nothing.
  unlocked(lockedRange('shop_price_modifier', 'Shop Price Modifier', 'shops', 'active',
    SHOP_PRICE_MODIFIER_MIN, SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_DEFAULT)),
  // The reference's single capacity toggle is gone: this app makes the same
  // decision per family through the synthetic capacity rows below. Its key
  // survives only as the v1 snapshot spelling (capacity-option-keys.ts), read
  // on migration and never shown.
  ...CAPACITY_OPTION_SEEDS,
  ...CAPACITY_BONUS_OPTION_SEEDS,
  // The pond's own rows: what it sells and what it charges, on top of whatever
  // the capacity families decided. Baseline is the legacy pond.
  ...POND_OPTION_SEEDS,
  lockedChoice('shuffle_prizes', 'Shuffle Prizes', 'items', 'not-implemented',
    choices(['off', 0], ['general', 1], ['bonk', 2], ['both', 3]), 'general', 'off'),
  lockedToggle('tile_shuffle', 'Tile Shuffle', 'enemies', 'not-implemented'),
  lockedChoice('misery_mire_medallion', 'Misery Mire Medallion', 'world', 'vanilla-fixed', MEDALLION, 'random', 'ether'),
  lockedChoice('turtle_rock_medallion', 'Turtle Rock Medallion', 'world', 'vanilla-fixed', MEDALLION, 'random', 'quake'),
  lockedToggle('glitch_boots', 'Glitched Starting Boots', 'world', 'not-applicable', true),
  lockedRange('beemizer_total_chance', 'Beemizer Total Chance', 'items', 'not-implemented', 0, 100, 0),
  lockedRange('beemizer_trap_chance', 'Beemizer Trap Chance', 'items', 'not-implemented', 0, 100, 60, 0),
  lockedChoice('timer', 'Timer', 'timers', 'not-implemented', choices(
    ['none', 0], ['timed', 1], ['timed_ohko', 2, 'Timed OHKO'], ['ohko', 3, 'OHKO'],
    ['timed_countdown', 4], ['display', 5],
  ), 'none'),
  lockedRange('countdown_start_time', 'Countdown Start Time', 'timers', 'not-implemented', 0, 480, 10, 0),
  lockedRange('red_clock_time', 'Red Clock Time', 'timers', 'not-implemented', -60, 60, -2, 0),
  lockedRange('blue_clock_time', 'Blue Clock Time', 'timers', 'not-implemented', -60, 60, 2, 0),
  lockedRange('green_clock_time', 'Green Clock Time', 'timers', 'not-implemented', -60, 60, 4, 0),
  // The two rows that describe a session shared with other players instead of
  // the seed's own shape. They ride along on the world tab, which opens the
  // panel, because neither belongs to a subject the other tabs own.
  lockedToggle('death_link', 'Death Link', 'session', 'not-implemented'),
  lockedToggle('allow_collect', 'Collect checks for other players', 'session', 'not-applicable', true),
];

/**
 * A description entry, split into the two readings the catalog carries: the
 * flattened string every plain consumer uses, and the lines a panel renders
 * when the entry was written as a list. A row with no entry has nothing to
 * add to its label and carries an empty description.
 */
const describe = (key: string): Pick<ApOptionDef, 'description' | 'details'> => {
  const entry = AP_OPTION_DESCRIPTIONS[key];
  if (entry === undefined) return { description: '', details: undefined };
  return { description: plainTextOf(entry), details: detailsOf(entry) };
};

const apOptionCatalog: readonly ApOptionDef[] =
  seeds.map((seed) => ({ ...seed, ...describe(seed.key) }));

const apOptionByKey: ReadonlyMap<string, ApOptionDef> =
  new Map(apOptionCatalog.map((option) => [option.key, option]));

const apBaselineValues: Readonly<Record<string, ApOptionValue>> =
  Object.fromEntries(apOptionCatalog.map((option) => [option.key, option.baseline]));

export { AP_OPTION_GROUPS, MEDALLION_OPTION_KEYS, apBaselineValues, apOptionByKey, apOptionCatalog };
