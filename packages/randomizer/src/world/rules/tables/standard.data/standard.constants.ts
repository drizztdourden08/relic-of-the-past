/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import { REGION } from '../../../region-ids.data';
import { allOf, canCollect, canReach, hasItem, hasKeys } from '../../combinators';
import { killStart } from '../../helper-rules';
import type { RuleEntry } from '../../rule-entry.type';

const STANDARD_RULES: readonly RuleEntry[] = [
  {
    kind: 'exit', target: 'Throne Room', mode: 'set',
    rule: canCollect('check-102'),
  },
  { kind: 'exit', target: 'Hyrule Castle Exit (East)', mode: 'set', rule: canReach(REGION.sanctuary) },
  { kind: 'exit', target: 'Hyrule Castle Exit (West)', mode: 'set', rule: canReach(REGION.sanctuary) },
  { kind: 'exit', target: 'Links House Exit', mode: 'set', rule: canReach(REGION.sanctuary) },
  { kind: 'exit', target: 'Sanctuary S&Q', mode: 'set', rule: canReach(REGION.sanctuary) },
  {
    kind: 'location', target: 'check-109', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyHyruleCastle, 1), killStart(2)),
  },
  {
    kind: 'location', target: 'check-100', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyHyruleCastle, 1), killStart(1)),
  },
  { kind: 'location', target: 'check-108', mode: 'set', rule: killStart(1) },
  {
    kind: 'location', target: 'check-111', mode: 'set',
    rule: hasKeys(ITEM.smallKeyHyruleCastle, 2),
  },
  {
    kind: 'location', target: 'check-102', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyHyruleCastle, 2), hasItem(ITEM.bigKeyHyruleCastle)),
  },
  {
    kind: 'location', target: 'check-110', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyHyruleCastle, 3), killStart(1)),
  },
];

export { STANDARD_RULES };
