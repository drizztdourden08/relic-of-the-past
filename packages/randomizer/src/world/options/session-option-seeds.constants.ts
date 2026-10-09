/* @layer shared-game @kind constants */
import { MEDALLION_CHOICES } from './option-choice-sets.constants';
import { optionChoices } from './option-choices';
import { lockedChoice } from './locked-choice';
import { lockedRange } from './locked-range';
import { lockedToggle } from './locked-toggle';
import type { OptionSeed } from '../options.type';

const SESSION_OPTION_SEEDS: readonly OptionSeed[] = [
  lockedChoice('shuffle_prizes', 'Shuffle Prizes', 'items', 'not-implemented',
    optionChoices(['off', 0], ['general', 1], ['bonk', 2], ['both', 3]), 'general', 'off'),
  lockedToggle('tile_shuffle', 'Tile Shuffle', 'enemies', 'not-implemented'),
  lockedChoice('misery_mire_medallion', 'Misery Mire Medallion', 'world', 'vanilla-fixed', MEDALLION_CHOICES, 'random', 'ether'),
  lockedChoice('turtle_rock_medallion', 'Turtle Rock Medallion', 'world', 'vanilla-fixed', MEDALLION_CHOICES, 'random', 'quake'),
  lockedToggle('glitch_boots', 'Glitched Starting Boots', 'world', 'not-applicable', true),
  lockedRange('beemizer_total_chance', 'Beemizer Total Chance', 'items', 'not-implemented', 0, 100, 0),
  lockedRange('beemizer_trap_chance', 'Beemizer Trap Chance', 'items', 'not-implemented', 0, 100, 60, 0),
  lockedChoice('timer', 'Timer', 'timers', 'not-implemented', optionChoices(
    ['none', 0], ['timed', 1], ['timed_ohko', 2, 'Timed OHKO'], ['ohko', 3, 'OHKO'],
    ['timed_countdown', 4], ['display', 5],
  ), 'none'),
  lockedRange('countdown_start_time', 'Countdown Start Time', 'timers', 'not-implemented', 0, 480, 10, 0),
  lockedRange('red_clock_time', 'Red Clock Time', 'timers', 'not-implemented', -60, 60, -2, 0),
  lockedRange('blue_clock_time', 'Blue Clock Time', 'timers', 'not-implemented', -60, 60, 2, 0),
  lockedRange('green_clock_time', 'Green Clock Time', 'timers', 'not-implemented', -60, 60, 4, 0),
  lockedToggle('death_link', 'Death Link', 'session', 'active'),
  lockedToggle('allow_collect', 'Collect checks for other players', 'session', 'not-applicable', true),
];

export { SESSION_OPTION_SEEDS };
