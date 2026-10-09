/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids';
import { hasKeys } from '../../combinators';
import { canBombOrBonk, kill } from '../../helper-rules';
import type { RuleEntry } from '../../rule-entry.type';

const FIRST_CASTLE_RULES: readonly RuleEntry[] = [
  { kind: 'location', target: 'check-108', mode: 'set', rule: kill(1) },
  { kind: 'exit', target: 'Sewers Door', mode: 'set', rule: hasKeys(ITEM.smallKeyHyruleCastle, 4) },
  { kind: 'exit', target: 'Sewers Back Door', mode: 'set', rule: hasKeys(ITEM.smallKeyHyruleCastle, 4) },
  { kind: 'exit', target: 'Sewers Secret Room', mode: 'set', rule: canBombOrBonk },
];

export { FIRST_CASTLE_RULES };
