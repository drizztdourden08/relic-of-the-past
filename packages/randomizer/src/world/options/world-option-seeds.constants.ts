/* @layer shared-game @kind constants */
import { DARK_ROOM_OPTION_SEEDS } from '../dark-rooms/dark-room-options.constants';
import { STORY_GATE_OPTION_SEEDS } from '../story-gates/story-gate-options.constants';
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
  unlocked(lockedChoice({ key: 'accessibility', displayName: 'Accessibility', group: 'world', implementation: 'active' }, optionChoices(['full', 0], ['items', 1], ['minimal', 2]), 'items', 'full')),
  lockedText({ key: 'plando_connections', displayName: 'Plando Connections', group: 'other', implementation: 'not-implemented' }, ''),
  lockedText({ key: 'start_inventory_from_pool', displayName: 'Starting inventory', group: 'items', implementation: 'not-implemented' }, ''),
  lockedChoice({ key: 'goal', displayName: 'Goal', group: 'goal', implementation: 'active' }, optionChoices(
    ['ganon', 0], ['crystals', 1], ['bosses', 2], ['pedestal', 3], ['ganon_pedestal', 4],
    ['triforce_hunt', 5], ['local_triforce_hunt', 6], ['ganon_triforce_hunt', 7],
    ['local_ganon_triforce_hunt', 8],
  ), 'ganon'),
  lockedChoice({ key: 'mode', displayName: 'Mode', group: 'world', implementation: 'active' },
    optionChoices(['standard', 0], ['open', 1], ['inverted', 2]), 'open', 'standard'),
  lockedChoice({ key: 'glitches_required', displayName: 'Glitches Required', group: 'world', implementation: 'active' }, optionChoices(
    ['no_glitches', 0], ['minor_glitches', 1], ['overworld_glitches', 2],
    ['hybrid_major_glitches', 3], ['no_logic', 4],
  ), 'no_glitches'),
  ...DARK_ROOM_OPTION_SEEDS,
  ...STORY_GATE_OPTION_SEEDS,
  lockedChoice({ key: 'triforce_pieces_mode', displayName: 'Triforce Pieces Mode', group: 'goal', implementation: 'not-implemented' },
    optionChoices(['extra', 0], ['percentage', 1], ['available', 2]), 'available'),
  lockedRange({ key: 'triforce_pieces_percentage', displayName: 'Triforce Pieces Percentage', group: 'goal', implementation: 'not-implemented' }, { min: 100, max: 1000 }, 150),
  lockedRange({ key: 'triforce_pieces_required', displayName: 'Triforce Pieces Required', group: 'goal', implementation: 'not-implemented' }, { min: 1, max: 90 }, 20),
  lockedRange({ key: 'triforce_pieces_available', displayName: 'Triforce Pieces Available', group: 'goal', implementation: 'not-implemented' }, { min: 1, max: 90 }, 30),
  lockedRange({ key: 'triforce_pieces_extra', displayName: 'Triforce Pieces Extra', group: 'goal', implementation: 'not-implemented' }, { min: 0, max: 89 }, 10),
  lockedChoice({ key: 'entrance_shuffle', displayName: 'Entrance Shuffle', group: 'world', implementation: 'active' }, optionChoices(
    ['vanilla', 0], ['dungeons_simple', 1], ['dungeons_full', 2], ['dungeons_crossed', 3],
    ['simple', 4], ['restricted', 5], ['full', 6], ['crossed', 7], ['insanity', 8],
  ), 'vanilla'),
  lockedText({ key: 'entrance_shuffle_seed', displayName: 'Entrance Shuffle Seed', group: 'world', implementation: 'not-implemented' }, 'random'),
  unlocked(lockedChoice({ key: 'big_key_shuffle', displayName: 'Big Key Shuffle', group: 'dungeon-items', implementation: 'active' }, DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  unlocked(lockedChoice({ key: 'small_key_shuffle', displayName: 'Small Key Shuffle', group: 'dungeon-items', implementation: 'active' }, SMALL_KEY_CHOICES, 'original_dungeon')),
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
  unlocked(lockedChoice({ key: 'compass_shuffle', displayName: 'Compass Shuffle', group: 'dungeon-items', implementation: 'active' }, DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  unlocked(lockedChoice({ key: 'map_shuffle', displayName: 'Map Shuffle', group: 'dungeon-items', implementation: 'active' }, DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  lockedToggle({ key: 'restrict_dungeon_item_on_boss', displayName: 'Prevent Dungeon Item on Boss', group: 'dungeon-items', implementation: 'vanilla-fixed' }),
];

export { WORLD_OPTION_SEEDS };
