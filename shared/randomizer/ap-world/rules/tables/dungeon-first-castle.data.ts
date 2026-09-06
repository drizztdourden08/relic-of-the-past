/* @layer shared-game @kind data */
/**
 * The first castle + its sewers: the mode-independent rows from
 * Archipelago worlds/alttp/Rules.py global_rules 304-312 (the 309
 * universal-key clause is off in the baseline). The 304-305 guard-drop kill
 * rule is later replaced by the standard-mode table (standard.data.ts),
 * exactly as standard_rules re-sets it after global_rules in the source.
 */
import { hasKeys } from '../combinators';
import { canBombOrBonk } from '../../state-helpers';
import { canKillMostThings } from '../../state-helpers-world';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

const FIRST_CASTLE_RULES: readonly RuleEntry[] = [
  // 304-305
  { kind: 'location', name: 'Hyrule Castle - Map Guard Key Drop', mode: 'set', rule: kill(1) },
  // 307-311 (universal-key branch off in the baseline)
  { kind: 'exit', name: 'Sewers Door', mode: 'set', rule: hasKeys('Small Key (Hyrule Castle)', 4) },
  { kind: 'exit', name: 'Sewers Back Door', mode: 'set', rule: hasKeys('Small Key (Hyrule Castle)', 4) },
  // 312
  { kind: 'exit', name: 'Sewers Secret Room', mode: 'set', rule: canBombOrBonk },
];

export { FIRST_CASTLE_RULES };
