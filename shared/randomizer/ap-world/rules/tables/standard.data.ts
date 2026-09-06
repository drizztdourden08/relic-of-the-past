/* @layer shared-game @kind data */
/**
 * Standard-mode rules, ported from tests/fixtures/ap-source/Rules.py
 * standard_rules (lines 1090-1121) for the fixed baseline (small keys stay
 * in their own dungeon, never universal, so the 1099-1116 branch applies;
 * enemy health is default, so the guarded chest's kill clause collapses to
 * true, 1113-1115). The escape gating: the throne door opens only once the
 * cell chest is collectable (1093), the two upper castle exits and both
 * retry spawns open only once the church is reachable through the escape
 * (1094-1097), and every escape kill check uses the start-arsenal helper
 * (StateHelpers.py can_kill_standard_start). The start connection itself
 * ('Uncle S&Q', 1091-1092) is wired in connections-mandatory.data.ts and
 * carries no rule (always open).
 */
import { allOf, canCollect, canReach, hasItem, hasKeys } from '../combinators';
import { canKillStandardStart } from '../../state-helpers-world';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const killStart = (enemies: number) => (state: CollectionState): boolean =>
  canKillStandardStart(state, enemies);

const STANDARD_RULES: readonly RuleEntry[] = [
  // 1093
  {
    kind: 'exit', name: 'Throne Room', mode: 'set',
    rule: canCollect('Hyrule Castle - Zelda\'s Chest'),
  },
  // 1094-1095
  { kind: 'exit', name: 'Hyrule Castle Exit (East)', mode: 'set', rule: canReach('Sanctuary') },
  { kind: 'exit', name: 'Hyrule Castle Exit (West)', mode: 'set', rule: canReach('Sanctuary') },
  // 1096-1097
  { kind: 'exit', name: 'Links House S&Q', mode: 'set', rule: canReach('Sanctuary') },
  { kind: 'exit', name: 'Sanctuary S&Q', mode: 'set', rule: canReach('Sanctuary') },
  // 1100-1102
  {
    kind: 'location', name: 'Hyrule Castle - Boomerang Guard Key Drop', mode: 'set',
    rule: allOf(hasKeys('Small Key (Hyrule Castle)', 1), killStart(2)),
  },
  // 1103-1105
  {
    kind: 'location', name: 'Hyrule Castle - Boomerang Chest', mode: 'set',
    rule: allOf(hasKeys('Small Key (Hyrule Castle)', 1), killStart(1)),
  },
  // 1106-1107 (replaces the global_rules 304-305 most-things kill)
  { kind: 'location', name: 'Hyrule Castle - Map Guard Key Drop', mode: 'set', rule: killStart(1) },
  // 1108-1109
  {
    kind: 'location', name: 'Hyrule Castle - Big Key Drop', mode: 'set',
    rule: hasKeys('Small Key (Hyrule Castle)', 2),
  },
  // 1110-1115 (enemy health default -> the kill clause is satisfied)
  {
    kind: 'location', name: 'Hyrule Castle - Zelda\'s Chest', mode: 'set',
    rule: allOf(hasKeys('Small Key (Hyrule Castle)', 2), hasItem('Big Key (Hyrule Castle)')),
  },
  // 1117-1119
  {
    kind: 'location', name: 'Sewers - Key Rat Key Drop', mode: 'set',
    rule: allOf(hasKeys('Small Key (Hyrule Castle)', 3), killStart(1)),
  },
];

export { STANDARD_RULES };
