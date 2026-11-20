/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
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
    displayName: msg('randomizer-world:option.include_npc_checks'),
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
    displayName: msg('randomizer-world:option.include_world_items'),
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
    displayName: msg('randomizer-world:option.dungeon_prize_shuffle'),
    group: 'dungeon-items',
    kind: 'toggle',
    implementation: 'active',
    sourceDefault: true,
    baseline: true,
    locked: false,
    synthetic: true,
  },
  unlocked(lockedChoice({ key: 'accessibility', displayName: msg('randomizer-world:option.accessibility'), group: 'world', implementation: 'active' }, optionChoices(['full', 0], ['items', 1], ['minimal', 2]), 'items', 'full')),
  lockedText({ key: 'plando_connections', displayName: msg('randomizer-world:option.plando_connections'), group: 'other', implementation: 'not-implemented' }, ''),
  lockedText({ key: 'start_inventory_from_pool', displayName: msg('randomizer-world:option.start_inventory_from_pool'), group: 'items', implementation: 'not-implemented' }, ''),
  lockedChoice({ key: 'goal', displayName: msg('randomizer-world:option.goal'), group: 'goal', implementation: 'active' }, optionChoices(
    ['ganon', 0], ['crystals', 1], ['bosses', 2], ['pedestal', 3], ['ganon_pedestal', 4],
    ['triforce_hunt', 5], ['local_triforce_hunt', 6], ['ganon_triforce_hunt', 7],
    ['local_ganon_triforce_hunt', 8],
  ), 'ganon'),
  lockedChoice({ key: 'mode', displayName: msg('randomizer-world:option.mode'), group: 'world', implementation: 'active' },
    optionChoices(['standard', 0], ['open', 1], ['inverted', 2]), 'open', 'standard'),
  lockedChoice({ key: 'glitches_required', displayName: msg('randomizer-world:option.glitches_required'), group: 'world', implementation: 'active' }, optionChoices(
    ['no_glitches', 0], ['minor_glitches', 1], ['overworld_glitches', 2],
    ['hybrid_major_glitches', 3], ['no_logic', 4],
  ), 'no_glitches'),
  ...DARK_ROOM_OPTION_SEEDS,
  ...STORY_GATE_OPTION_SEEDS,
  lockedChoice({ key: 'triforce_pieces_mode', displayName: msg('randomizer-world:option.triforce_pieces_mode'), group: 'goal', implementation: 'not-implemented' },
    optionChoices(['extra', 0], ['percentage', 1], ['available', 2]), 'available'),
  lockedRange({ key: 'triforce_pieces_percentage', displayName: msg('randomizer-world:option.triforce_pieces_percentage'), group: 'goal', implementation: 'not-implemented' }, { min: 100, max: 1000 }, 150),
  lockedRange({ key: 'triforce_pieces_required', displayName: msg('randomizer-world:option.triforce_pieces_required'), group: 'goal', implementation: 'not-implemented' }, { min: 1, max: 90 }, 20),
  lockedRange({ key: 'triforce_pieces_available', displayName: msg('randomizer-world:option.triforce_pieces_available'), group: 'goal', implementation: 'not-implemented' }, { min: 1, max: 90 }, 30),
  lockedRange({ key: 'triforce_pieces_extra', displayName: msg('randomizer-world:option.triforce_pieces_extra'), group: 'goal', implementation: 'not-implemented' }, { min: 0, max: 89 }, 10),
  lockedChoice({ key: 'entrance_shuffle', displayName: msg('randomizer-world:option.entrance_shuffle'), group: 'world', implementation: 'active' }, optionChoices(
    ['vanilla', 0], ['dungeons_simple', 1], ['dungeons_full', 2], ['dungeons_crossed', 3],
    ['simple', 4], ['restricted', 5], ['full', 6], ['crossed', 7], ['insanity', 8],
  ), 'vanilla'),
  lockedText({ key: 'entrance_shuffle_seed', displayName: msg('randomizer-world:option.entrance_shuffle_seed'), group: 'world', implementation: 'not-implemented' }, 'random'),
  unlocked(lockedChoice({ key: 'big_key_shuffle', displayName: msg('randomizer-world:option.big_key_shuffle'), group: 'dungeon-items', implementation: 'active' }, DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  unlocked(lockedChoice({ key: 'small_key_shuffle', displayName: msg('randomizer-world:option.small_key_shuffle'), group: 'dungeon-items', implementation: 'active' }, SMALL_KEY_CHOICES, 'original_dungeon')),
  {
    key: 'key_drop_shuffle',
    displayName: msg('randomizer-world:option.key_drop_shuffle'),
    group: 'dungeon-items',
    kind: 'toggle',
    implementation: 'active',
    sourceDefault: true,
    baseline: true,
    locked: false,
  },
  unlocked(lockedChoice({ key: 'compass_shuffle', displayName: msg('randomizer-world:option.compass_shuffle'), group: 'dungeon-items', implementation: 'active' }, DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  unlocked(lockedChoice({ key: 'map_shuffle', displayName: msg('randomizer-world:option.map_shuffle'), group: 'dungeon-items', implementation: 'active' }, DUNGEON_ITEM_CHOICES, 'original_dungeon')),
  lockedToggle({ key: 'restrict_dungeon_item_on_boss', displayName: msg('randomizer-world:option.restrict_dungeon_item_on_boss'), group: 'dungeon-items', implementation: 'vanilla-fixed' }),
];

export { WORLD_OPTION_SEEDS };
