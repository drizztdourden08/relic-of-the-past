/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../../combinators';
import { bombs } from '../../helper-rules';
import { actGate } from '../../../events';
import { dungeonBossDefeat } from '../bosses';
import type { RuleEntry } from '../../rule-entry.type';

const THIEVES_DEN_RULES: readonly RuleEntry[] = [
  { kind: 'exit', target: 'Thieves Town', mode: 'set', rule: allOf(hasItem(ITEM.moonPearl), actGate('check-333')) },
  { kind: 'exit', target: 'Thieves Town Big Key Door', mode: 'set', rule: hasItem(ITEM.bigKeyThievesTown) },
  {
    kind: 'exit', target: 'Blind Fight', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyThievesTown, 3), bombs()),
  },
  {
    kind: 'location', target: 'check-178', mode: 'set',
    rule: allOf(
      anyOf(
        hasKeys(ITEM.smallKeyThievesTown, 3),
        allOf(
          placedAt('check-178', ITEM.smallKeyThievesTown),
          hasKeys(ITEM.smallKeyThievesTown, 2),
        ),
      ),
      hasItem(ITEM.hammer),
    ),
  },
  { kind: 'location', target: 'check-179', mode: 'set', rule: hasKeys(ITEM.smallKeyThievesTown, 1) },
  { kind: 'location', target: 'check-177', mode: 'set', rule: hasKeys(ITEM.smallKeyThievesTown, 3) },
  {
    kind: 'location', target: 'check-183', mode: 'set',
    rule: hasKeys(ITEM.smallKeyThievesTown, 1),
  },
  { kind: 'location', target: 'check-180', mode: 'add', rule: dungeonBossDefeat('dungeon-009') },
  { kind: 'location', target: 'check-181', mode: 'add', rule: dungeonBossDefeat('dungeon-009') },
];

export { THIEVES_DEN_RULES };
