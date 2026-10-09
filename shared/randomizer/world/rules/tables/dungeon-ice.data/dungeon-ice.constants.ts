/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, either, hasItem, hasKeys, placedIn,
} from '../../combinators';
import { bombs, canLiftRocks, canMeltThings } from '../../helper-rules';
import { dungeonBossDefeat } from '../bosses.data';
import type { RuleEntry } from '../../rule-entry.type';

const BOMBS = bombs();

const BIG_KEY_BEYOND_EAST_DOOR = placedIn(ITEM.bigKeyIcePalace, [
  'check-199',
  'check-206',
  'check-200',
  'check-201',
]);

const ICE_RULES: readonly RuleEntry[] = [
  { kind: 'location', target: 'check-204', mode: 'set', rule: canMeltThings },
  {
    kind: 'location', target: 'check-195', mode: 'set',
    rule: allOf(canMeltThings, hasKeys(ITEM.smallKeyIcePalace, 1)),
  },
  {
    kind: 'exit', target: 'Ice Palace (Second Section)', mode: 'set',
    rule: allOf(canMeltThings, hasKeys(ITEM.smallKeyIcePalace, 1), BOMBS),
  },
  { kind: 'exit', target: 'Ice Palace (Main)', mode: 'set', rule: hasKeys(ITEM.smallKeyIcePalace, 2) },
  { kind: 'location', target: 'check-197', mode: 'set', rule: hasItem(ITEM.bigKeyIcePalace) },
  {
    kind: 'exit', target: 'Ice Palace (Kholdstare)', mode: 'set',
    rule: allOf(
      canLiftRocks,
      hasItem(ITEM.hammer),
      hasItem(ITEM.bigKeyIcePalace),
      anyOf(
        hasKeys(ITEM.smallKeyIcePalace, 6),
        allOf(hasItem(ITEM.caneOfSomaria), hasKeys(ITEM.smallKeyIcePalace, 5)),
      ),
    ),
  },
  {
    kind: 'exit', target: 'Ice Palace (East)', mode: 'set',
    rule: anyOf(
      hasItem(ITEM.hookshot),
      either(
        BIG_KEY_BEYOND_EAST_DOOR,
        hasKeys(ITEM.smallKeyIcePalace, 4),
        hasKeys(ITEM.smallKeyIcePalace, 6),
      ),
    ),
  },
  {
    kind: 'exit', target: 'Ice Palace (East Top)', mode: 'set',
    rule: allOf(canLiftRocks, hasItem(ITEM.hammer)),
  },
  { kind: 'location', target: 'check-202', mode: 'add', rule: dungeonBossDefeat('dungeon-010') },
  { kind: 'location', target: 'check-203', mode: 'add', rule: dungeonBossDefeat('dungeon-010') },
];

export { ICE_RULES };
