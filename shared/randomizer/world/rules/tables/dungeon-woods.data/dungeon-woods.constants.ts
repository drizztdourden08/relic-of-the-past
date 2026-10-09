/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, never,
} from '../../combinators';
import { bombs, hasSword } from '../../helper-rules';
import { actGate } from '../../../events';
import { dungeonBossDefeat } from '../bosses.data';
import { compileRule } from '../../rule-eval';
import { option } from '../../rule-node-build';
import type { RuleEntry } from '../../rule-entry.type';

const CURTAINS_PULLABLE = compileRule(option('itemPower.pullableCurtains', true));

const FIRST_SECTION_KEY_DOORS: readonly string[] = [
  'Skull Woods First Section South Door',
  'Skull Woods First Section (Right) North Door',
  'Skull Woods First Section West Door',
  'Skull Woods First Section (Left) Door to Exit',
];

const WOODS_RULES: readonly RuleEntry[] = [
  { kind: 'exit', target: 'Skull Woods First Section Hole (North)', mode: 'set', rule: hasItem(ITEM.moonPearl) },
  { kind: 'exit', target: 'Skull Woods Second Section Hole', mode: 'set', rule: hasItem(ITEM.moonPearl) },
  {
    kind: 'exit', target: 'Skull Woods Final Section', mode: 'set',
    rule: allOf(actGate('check-343'), hasItem(ITEM.moonPearl)),
  },
  ...FIRST_SECTION_KEY_DOORS.map((target): RuleEntry => ({
    kind: 'exit', target, mode: 'set', rule: hasKeys(ITEM.smallKeySkullWoods, 5),
  })),
  {
    kind: 'location', target: 'check-186', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeySkullWoods), bombs()),
  },
  {
    kind: 'exit', target: 'Skull Woods Torch Room', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeySkullWoods, 4), hasItem(ITEM.fireRod),
      anyOf(hasSword, CURTAINS_PULLABLE)),
  },
  { kind: 'exit', target: 'Skull Woods First Section Bomb Jump', mode: 'set', rule: never },
  { kind: 'location', target: 'check-191', mode: 'add', rule: dungeonBossDefeat('dungeon-008') },
  { kind: 'location', target: 'check-192', mode: 'add', rule: dungeonBossDefeat('dungeon-008') },
  { kind: 'location', target: 'check-191', mode: 'add', rule: hasKeys(ITEM.smallKeySkullWoods, 5) },
  { kind: 'location', target: 'check-192', mode: 'add', rule: hasKeys(ITEM.smallKeySkullWoods, 5) },
];

export { WOODS_RULES };
