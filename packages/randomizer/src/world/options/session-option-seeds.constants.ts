/* @layer shared-game @kind constants */
import { MEDALLION_CHOICES } from './option-choice-sets.constants';
import { optionChoices } from './option-choices';
import { lockedChoice } from './locked-choice';
import { lockedRange } from './locked-range';
import { lockedToggle } from './locked-toggle';
import { unlocked } from './unlocked';
import type { OptionSeed } from '../options.type';

const SESSION_OPTION_SEEDS: readonly OptionSeed[] = [
  lockedChoice({ key: 'shuffle_prizes', displayName: 'Shuffle Prizes', group: 'items', implementation: 'not-implemented' },
    optionChoices(['off', 0], ['general', 1], ['bonk', 2], ['both', 3]), 'general', 'off'),
  lockedToggle({ key: 'tile_shuffle', displayName: 'Tile Shuffle', group: 'enemies', implementation: 'not-implemented' }),
  lockedChoice({ key: 'misery_mire_medallion', displayName: 'Misery Mire Medallion', group: 'world', implementation: 'vanilla-fixed' }, MEDALLION_CHOICES, 'random', 'ether'),
  lockedChoice({ key: 'turtle_rock_medallion', displayName: 'Turtle Rock Medallion', group: 'world', implementation: 'vanilla-fixed' }, MEDALLION_CHOICES, 'random', 'quake'),
  lockedToggle({ key: 'glitch_boots', displayName: 'Glitched Starting Boots', group: 'world', implementation: 'not-applicable' }, true),
  lockedRange({ key: 'beemizer_total_chance', displayName: 'Beemizer Total Chance', group: 'items', implementation: 'not-implemented' }, { min: 0, max: 100 }, 0),
  lockedRange({ key: 'beemizer_trap_chance', displayName: 'Beemizer Trap Chance', group: 'items', implementation: 'not-implemented' }, { min: 0, max: 100 }, 60, 0),
  lockedChoice({ key: 'timer', displayName: 'Timer', group: 'timers', implementation: 'not-implemented' }, optionChoices(
    ['none', 0], ['timed', 1], ['timed_ohko', 2, 'Timed OHKO'], ['ohko', 3, 'OHKO'],
    ['timed_countdown', 4], ['display', 5],
  ), 'none'),
  lockedRange({ key: 'countdown_start_time', displayName: 'Countdown Start Time', group: 'timers', implementation: 'not-implemented' }, { min: 0, max: 480 }, 10, 0),
  lockedRange({ key: 'red_clock_time', displayName: 'Red Clock Time', group: 'timers', implementation: 'not-implemented' }, { min: -60, max: 60 }, -2, 0),
  lockedRange({ key: 'blue_clock_time', displayName: 'Blue Clock Time', group: 'timers', implementation: 'not-implemented' }, { min: -60, max: 60 }, 2, 0),
  lockedRange({ key: 'green_clock_time', displayName: 'Green Clock Time', group: 'timers', implementation: 'not-implemented' }, { min: -60, max: 60 }, 4, 0),
  unlocked(lockedToggle({ key: 'death_link', displayName: 'Death Link', group: 'session', implementation: 'active' })),
  lockedToggle({ key: 'allow_collect', displayName: 'Collect checks for other players', group: 'session', implementation: 'not-applicable' }, true),
];

export { SESSION_OPTION_SEEDS };
