/* @layer shared-game @kind data */
/**
 * The eastern palace, from tests/fixtures/ap-source/Rules.py global_rules
 * 327-358 (enemy shuffle off → the boss needs arrows, 348-350; enemy health
 * default → the pot-kill block 352-358 is skipped). Lamp requirements come
 * from the lamp table; the big-key self-allowance lives in the item-rules
 * table.
 */
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../combinators';
import { canShootArrows } from '../../state-helpers';
import { canKillMostThings } from '../../state-helpers-world';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

/** 340-350: big key + both keys + the boss fight, and (no enemy shuffle) arrows. */
const bossAccess = allOf(
  hasItem('Big Key (Eastern Palace)'),
  hasKeys('Small Key (Eastern Palace)', 2),
  dungeonBossDefeat('Eastern Palace'),
  (state: CollectionState) => canShootArrows(state),
);

const EAST_PALACE_RULES: readonly RuleEntry[] = [
  // 329-333
  {
    kind: 'location', name: 'Eastern Palace - Big Key Chest', mode: 'set',
    rule: allOf(kill(5), anyOf(
      hasKeys('Small Key (Eastern Palace)', 2),
      allOf(
        placedAt('Eastern Palace - Big Key Chest', 'Big Key (Eastern Palace)'),
        hasKeys('Small Key (Eastern Palace)', 1),
      ),
    )),
  },
  // 334-335
  {
    kind: 'location', name: 'Eastern Palace - Dark Eyegore Key Drop', mode: 'set',
    rule: allOf(hasItem('Big Key (Eastern Palace)'), kill(1)),
  },
  // 336-337
  {
    kind: 'location', name: 'Eastern Palace - Big Chest', mode: 'set',
    rule: hasItem('Big Key (Eastern Palace)'),
  },
  // 340-350
  { kind: 'location', name: 'Eastern Palace - Boss', mode: 'add', rule: bossAccess },
  { kind: 'location', name: 'Eastern Palace - Prize', mode: 'add', rule: bossAccess },
];

export { EAST_PALACE_RULES };
