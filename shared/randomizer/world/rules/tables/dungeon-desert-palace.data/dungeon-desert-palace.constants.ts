/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import { REGION } from '../../../region-ids.data';
import {
  allOf, hasItem, hasKeys,
} from '../../combinators';
import { canLiftRocks, hasFireSource, kill } from '../../helper-rules';
import { actGate } from '../../../events';
import { compileRule } from '../../rule-eval';
import { any, option, region } from '../../rule-node-build';
import { dungeonBossDefeat } from '../bosses.data';
import type { RuleEntry } from '../../rule-entry.type';

const PRIZE_GUARD = compileRule(any(
  option('dungeonItems.keyFamilyPinned', false),
  region(REGION.desertPalaceOuter),
));

const BOSS_ACCESS = allOf(
  hasKeys(ITEM.smallKeyDesertPalace, 4),
  hasItem(ITEM.bigKeyDesertPalace),
  hasFireSource,
  dungeonBossDefeat('dungeon-004'),
);

const DESERT_PALACE_RULES: readonly RuleEntry[] = [
  { kind: 'exit', target: 'Desert Palace Stairs', mode: 'set', rule: actGate('check-353') },
  { kind: 'exit', target: 'Desert Palace Entrance (North) Rocks', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Desert Ledge Return Rocks', mode: 'set', rule: canLiftRocks },
  {
    kind: 'location', target: 'check-125', mode: 'set',
    rule: hasItem(ITEM.bigKeyDesertPalace),
  },
  { kind: 'location', target: 'check-126', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  { kind: 'exit', target: 'Desert Palace East Wing', mode: 'set', rule: hasKeys(ITEM.smallKeyDesertPalace, 4) },
  { kind: 'location', target: 'check-129', mode: 'set', rule: kill(3) },
  {
    kind: 'location', target: 'check-133', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyDesertPalace, 2), kill(4)),
  },
  {
    kind: 'location', target: 'check-134', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyDesertPalace, 3), kill(4)),
  },
  { kind: 'location', target: 'check-130', mode: 'add', rule: BOSS_ACCESS },
  { kind: 'location', target: 'check-131', mode: 'add', rule: BOSS_ACCESS },
  {
    kind: 'location', target: 'check-131', mode: 'add',
    rule: PRIZE_GUARD,
  },
];

export { DESERT_PALACE_RULES };
