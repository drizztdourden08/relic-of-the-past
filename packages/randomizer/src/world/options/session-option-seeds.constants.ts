/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { MEDALLION_CHOICES } from './option-choice-sets.constants';
import { optionChoices } from './option-choices';
import { lockedChoice } from './locked-choice';
import { lockedRange } from './locked-range';
import { lockedToggle } from './locked-toggle';
import { unlocked } from './unlocked';
import type { OptionSeed } from '../options.type';

const SESSION_OPTION_SEEDS: readonly OptionSeed[] = [
  lockedChoice({ key: 'shuffle_prizes', displayName: msg('randomizer-world:option.shuffle_prizes'), group: 'items', implementation: 'not-implemented' },
    optionChoices(['off', 0], ['general', 1], ['bonk', 2], ['both', 3]), 'general', 'off'),
  lockedToggle({ key: 'tile_shuffle', displayName: msg('randomizer-world:option.tile_shuffle'), group: 'enemies', implementation: 'not-implemented' }),
  lockedChoice({ key: 'misery_mire_medallion', displayName: msg('randomizer-world:option.misery_mire_medallion'), group: 'world', implementation: 'vanilla-fixed' }, MEDALLION_CHOICES, 'random', 'ether'),
  lockedChoice({ key: 'turtle_rock_medallion', displayName: msg('randomizer-world:option.turtle_rock_medallion'), group: 'world', implementation: 'vanilla-fixed' }, MEDALLION_CHOICES, 'random', 'quake'),
  lockedToggle({ key: 'glitch_boots', displayName: msg('randomizer-world:option.glitch_boots'), group: 'world', implementation: 'not-applicable' }, true),
  lockedRange({ key: 'beemizer_total_chance', displayName: msg('randomizer-world:option.beemizer_total_chance'), group: 'items', implementation: 'not-implemented' }, { min: 0, max: 100 }, 0),
  lockedRange({ key: 'beemizer_trap_chance', displayName: msg('randomizer-world:option.beemizer_trap_chance'), group: 'items', implementation: 'not-implemented' }, { min: 0, max: 100 }, 60, 0),
  lockedChoice({ key: 'timer', displayName: msg('randomizer-world:option.timer'), group: 'timers', implementation: 'not-implemented' }, optionChoices(
    ['none', 0], ['timed', 1], ['timed_ohko', 2], ['ohko', 3],
    ['timed_countdown', 4], ['display', 5],
  ), 'none'),
  lockedRange({ key: 'countdown_start_time', displayName: msg('randomizer-world:option.countdown_start_time'), group: 'timers', implementation: 'not-implemented' }, { min: 0, max: 480 }, 10, 0),
  lockedRange({ key: 'red_clock_time', displayName: msg('randomizer-world:option.red_clock_time'), group: 'timers', implementation: 'not-implemented' }, { min: -60, max: 60 }, -2, 0),
  lockedRange({ key: 'blue_clock_time', displayName: msg('randomizer-world:option.blue_clock_time'), group: 'timers', implementation: 'not-implemented' }, { min: -60, max: 60 }, 2, 0),
  lockedRange({ key: 'green_clock_time', displayName: msg('randomizer-world:option.green_clock_time'), group: 'timers', implementation: 'not-implemented' }, { min: -60, max: 60 }, 4, 0),
  unlocked(lockedToggle({ key: 'death_link', displayName: msg('randomizer-world:option.death_link'), group: 'session', implementation: 'active' })),
  lockedToggle({ key: 'allow_collect', displayName: msg('randomizer-world:option.allow_collect'), group: 'session', implementation: 'not-applicable' }, true),
];

export { SESSION_OPTION_SEEDS };
