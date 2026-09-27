/* @layer shared-game @kind data */
/**
 * The dark spots of the world: every exit and location the reference gates
 * on light, ported from Archipelago worlds/alttp/Rules.py
 * add_conditional_lamps (lines 989-1037, non-inverted spots) under the
 * baseline: neither light cone is set, so every conditional spot is listed.
 *
 * What each spot ASKS is not written here. The reference resolves it against
 * one three-way option (add_lamp_requirement, lines 158-169); this app asks
 * the same question through two settings the player owns, and every row below
 * carries the one predicate that reads them (dark-rooms/dark-room-light.ts).
 * So a spot can never be left behind on a hardcoded item check.
 *
 * The three unlit spots of the opening escape (1034-1037) are listed here
 * too, where the source skips them in the mode this app always plays. That
 * is the one deliberate divergence, and it goes the strict way: they are the
 * rooms a player is most often left feeling through, so they answer to the
 * same switch as every other dark spot. With the requirement on, a light is
 * guaranteed before them, since the fill has only the handful of rooms ahead of
 * the escape to place one in, and it does. With it off they open exactly as
 * the original does, and the opening is walked unlit.
 *
 * The two remaining names inside the unlit stretch are covered by these
 * three and carry no row of their own: both ways in are gated here, so
 * nothing beyond them is reachable without a light either.
 */
import { canCrossDarkRoom } from '../../dark-rooms/dark-room-light';
import { compileRule } from '../rule-eval';
import { any, option } from '../rule-node-build';
import type { LocationKey } from '../../location-key';
import type { Rule } from '../../world.type';
import type { RuleEntry } from '../rule-entry.type';

const LAMP_EXITS: readonly string[] = [
  'Misery Mire (Vitreous)',            // 1003
  'Turtle Rock (Dark Room) (North)',   // 1004
  'Turtle Rock (Dark Room) (South)',   // 1005
  'Palace of Darkness Big Key Door',   // 1006
  'Palace of Darkness Maze Door',      // 1007
  'Agahnim 1',                         // 1013
  'Old Man Cave Exit (East)',          // 1023
  'Death Mountain Return Cave Exit (East)', // 1024
  'Death Mountain Return Cave Exit (West)', // 1025
  'Old Man House Front to Back',       // 1026
  'Old Man House Back to Front',       // 1027
];

const LAMP_LOCATIONS: readonly LocationKey[] = [
  'check-149',  // 1008
  'check-150', // 1010
  'check-113',                   // 1014
  'check-114',        // 1015
  'check-115',     // 1016
  'check-060',                                    // 1022
  'check-123',       // 1028
  'check-124',     // 1029
  'check-119',             // 1030
  'check-121',                      // 1031
  'check-122',                     // 1032
];

/** Both ways into the opening's unlit stretch, and the check standing in it. */
const ESCAPE_DARK_EXITS: readonly string[] = ['Sewers Back Door', 'Throne Room']; // 1036-1037
const ESCAPE_DARK_LOCATIONS: readonly LocationKey[] = ['check-103']; // 1035

/**
 * The same question as every other dark spot, with one seam: a placement the
 * reference generated was rolled with these three ungated, so the parity
 * harness that replays one says so through the world option and gets the
 * reading it was generated under. No app path sets it.
 */
const canCrossEscapeDarkRoom: Rule = compileRule(any(option('unlitEscapeExempt', true), canCrossDarkRoom.node));

const exitRow = (rule: Rule) => (target: string): RuleEntry => ({ kind: 'exit', target, mode: 'add', rule });
const locationRow = (rule: Rule) => (target: LocationKey): RuleEntry => ({ kind: 'location', target, mode: 'add', rule });

const LAMP_RULES: readonly RuleEntry[] = [
  ...LAMP_EXITS.map(exitRow(canCrossDarkRoom)),
  ...LAMP_LOCATIONS.map(locationRow(canCrossDarkRoom)),
  ...ESCAPE_DARK_EXITS.map(exitRow(canCrossEscapeDarkRoom)),
  ...ESCAPE_DARK_LOCATIONS.map(locationRow(canCrossEscapeDarkRoom)),
];

export { ESCAPE_DARK_EXITS, ESCAPE_DARK_LOCATIONS, LAMP_EXITS, LAMP_LOCATIONS, LAMP_RULES };
