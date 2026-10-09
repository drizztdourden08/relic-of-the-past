/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../../combinators';
import { arrows, kill } from '../../helper-rules';
import { dungeonBossDefeat } from '../bosses.data';
import type { RuleEntry } from '../../rule-entry.type';

const BOSS_ACCESS = allOf(
  hasItem(ITEM.bigKeyEasternPalace),
  hasKeys(ITEM.smallKeyEasternPalace, 2),
  dungeonBossDefeat('dungeon-003'),
  arrows(),
);

const EAST_PALACE_RULES: readonly RuleEntry[] = [
  {
    kind: 'location', target: 'check-119', mode: 'set',
    rule: allOf(kill(5), anyOf(
      hasKeys(ITEM.smallKeyEasternPalace, 2),
      allOf(
        placedAt('check-119', ITEM.bigKeyEasternPalace),
        hasKeys(ITEM.smallKeyEasternPalace, 1),
      ),
    )),
  },
  {
    kind: 'location', target: 'check-124', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeyEasternPalace), kill(1)),
  },
  {
    kind: 'location', target: 'check-117', mode: 'set',
    rule: hasItem(ITEM.bigKeyEasternPalace),
  },
  { kind: 'location', target: 'check-121', mode: 'add', rule: BOSS_ACCESS },
  { kind: 'location', target: 'check-122', mode: 'add', rule: BOSS_ACCESS },
];

export { EAST_PALACE_RULES };
