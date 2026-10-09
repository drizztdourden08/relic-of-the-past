/* @layer shared-game @kind constants */
import { DARK_ROOM_OPTION_SEEDS } from '../dark-rooms/dark-room-options.constants';
import { STORY_GATE_OPTION_SEEDS } from '../story-gates/story-gate-options.data';
import { DUNGEON_ITEM_CHOICES, SMALL_KEY_CHOICES } from './option-choice-sets.constants';
import { optionChoices } from './option-choices';
import { lockedChoice } from './locked-choice';
import { lockedRange } from './locked-range';
import { lockedText } from './locked-text';
import { lockedToggle } from './locked-toggle';
import { unlocked } from './unlocked';
import type { OptionSeed } from '../options.type';

const WORLD_OPTION_SEEDS: readonly OptionSeed[] = [
  {
    key: 'include_npc_checks',
    displayName: 'Include NPC and event checks',
    group: 'scope',
    kind: 'toggle',
    implementation: 'active',
    sourceDefault: true,
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
    sourceDefault: true,
    baseline: true,
    locked: false,
    synthetic: true,
  },
  {
    key: 'dungeon_prize_shuffle',
    displayName: 'Shuffle Dungeon Prizes',
    group: 'dungeon-items',
    kind: 'toggle',
    implementation: 'active',
    sourceDefault: true,
    baseline: true,
    locked: false,
    synthetic: true,
  },
  unlocked(lockedChoice('accessibility', 'Accessibility',
    'world', 'active', optionChoices(['full', 0], ['items', 1], ['minimal', 2]), 'items', 'full')),
  lockedText('plando_connections', 'Plando Connections', 'other', 'not-implemented', ''),
  lockedText('start_inventory_from_pool', 'Starting inventory', 'items', 'not-implemented', ''),
  lockedChoice('goal', 'Goal', 'goal', 'active', optionChoices(
    ['ganon', 0], ['crystals', 1], ['bosses', 2], ['pedestal', 3], ['ganon_pedestal', 4],
    ['triforce_hunt', 5], ['local_triforce_hunt', 6], ['ganon_triforce_hunt', 7],
    ['local_ganon_triforce_hunt', 8],
  ), 'ganon'),
  lockedChoice('mode', 'Mode', 'world', 'active',
    optionChoices(['standard', 0], ['open', 1], ['inverted', 2]), 'open', 'standard'),
  lockedChoice('glitches_required', 'Glitches Required', 'world', 'active', optionChoices(
    ['no_glitches', 0], ['minor_glitches', 1], ['overworld_glitches', 2],
    ['hybrid_major_glitches', 3], ['no_logic', 4],
  ), 'no_glitches'),
  ...DARK_ROOM_OPTION_SEEDS,
  ...STORY_GATE_OPTION_SEEDS,
  lockedChoice('triforce_pieces_mode', 'Triforce Pieces Mode', 'goal', 'not-implemented',
    optionChoices(['extra', 0], ['percentage', 1], ['available', 2]), 'available'),
  lockedRange('triforce_pieces_percentage', 'Triforce Pieces Percentage', 'goal', 'not-implemented', 100, 1000, 150),
  lockedRange('triforce_pieces_required', 'Triforce Pieces Required', 'goal', 'not-implemented', 1, 90, 20),
  lockedRange('triforce_pieces_available', 'Triforce Pieces Available', 'goal', 'not-implemented', 1, 90, 30),
  lockedRange('triforce_pieces_extra', 'Triforce Pieces Extra', 'goal', 'not-implemented', 0, 89, 10),
  lockedChoice('entrance_shuffle', 'Entrance Shuffle', 'world', 'active', optionChoices(
    ['vanilla', 0], ['dungeons_simple', 1], ['dungeons_full', 2], ['dungeons_crossed', 3],
    ['simple', 4], ['restricted', 5], ['full', 6], ['crossed', 7], ['insanity', 8],
  ), 'vanilla'),
  lockedText('entrance_shuffle_seed', 'Entrance Shuffle Seed', 'world', 'not-implemented', 'random'),
  unlocked(lockedChoice('big_key_shuffle', 'Big Key Shuffle', 'dungeon-items', 'active', DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  unlocked(lockedChoice('small_key_shuffle', 'Small Key Shuffle', 'dungeon-items', 'active', SMALL_KEY_CHOICES, 'original_dungeon')),
  {
    key: 'key_drop_shuffle',
    displayName: 'Key Drop Shuffle',
    group: 'dungeon-items',
    kind: 'toggle',
    implementation: 'active',
    sourceDefault: true,
    baseline: true,
    locked: false,
  },
  unlocked(lockedChoice('compass_shuffle', 'Compass Shuffle', 'dungeon-items', 'active', DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  unlocked(lockedChoice('map_shuffle', 'Map Shuffle', 'dungeon-items', 'active', DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  lockedToggle('restrict_dungeon_item_on_boss', 'Prevent Dungeon Item on Boss', 'dungeon-items', 'vanilla-fixed'),
];

export { WORLD_OPTION_SEEDS };
