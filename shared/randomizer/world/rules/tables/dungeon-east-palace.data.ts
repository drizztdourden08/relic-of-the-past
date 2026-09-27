/* @layer shared-game @kind data */
/**
 * The eastern palace, from Archipelago worlds/alttp/Rules.py global_rules
 * 327-358 (enemy shuffle off → the boss needs arrows, 348-350; enemy health
 * default → the pot-kill block 352-358 is skipped). Lamp requirements come
 * from the lamp table; the big-key self-allowance lives in the item-rules
 * table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../combinators';
import { arrows, kill } from '../helper-rules';
import { dungeonBossDefeat } from './bosses.data';
import type { RuleEntry } from '../rule-entry.type';

/** 340-350: big key + both keys + the boss fight, and (no enemy shuffle) arrows. */
const bossAccess = allOf(
  hasItem(ITEM.bigKeyEasternPalace),
  hasKeys(ITEM.smallKeyEasternPalace, 2),
  dungeonBossDefeat('dungeon-003'),
  arrows(),
);

const EAST_PALACE_RULES: readonly RuleEntry[] = [
  // 329-333
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
  // 334-335
  {
    kind: 'location', target: 'check-124', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeyEasternPalace), kill(1)),
  },
  // 336-337
  {
    kind: 'location', target: 'check-117', mode: 'set',
    rule: hasItem(ITEM.bigKeyEasternPalace),
  },
  // 340-350
  { kind: 'location', target: 'check-121', mode: 'add', rule: bossAccess },
  { kind: 'location', target: 'check-122', mode: 'add', rule: bossAccess },
];

export { EAST_PALACE_RULES };
