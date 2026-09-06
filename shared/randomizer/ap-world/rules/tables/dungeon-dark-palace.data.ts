/* @layer shared-game @kind data */
/**
 * The eastern second-world palace, from tests/fixtures/ap-source/Rules.py:
 * the toll entrance (default_rules 681), global_rules 517-541 (enemy
 * shuffle off → the bonk wall needs arrows, 519-520; pot shuffle off →
 * 527-529 skipped) and the boss defeat rule. Lamp rows come from the lamp
 * table; the two small-key self-allowances live in the item-rules table.
 */
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../combinators';
import { canBombOrBonk, canShootArrows, canUseBombs } from '../../state-helpers';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (state: CollectionState): boolean => canUseBombs(state);
const arrows = (state: CollectionState): boolean => canShootArrows(state);

const DARK_PALACE_RULES: readonly RuleEntry[] = [
  // default_rules 681: the gatekeeper wants the real traveler.
  { kind: 'exit', name: 'Palace of Darkness', mode: 'set', rule: hasItem('Moon Pearl') },
  // 519-521
  { kind: 'exit', name: 'Palace of Darkness Bonk Wall', mode: 'set', rule: allOf(canBombOrBonk, arrows) },
  { kind: 'exit', name: 'Palace of Darkness Hammer Peg Drop', mode: 'set', rule: hasItem('Hammer') },
  // 522-524
  {
    kind: 'exit', name: 'Palace of Darkness Bridge Room', mode: 'set',
    rule: hasKeys('Small Key (Palace of Darkness)', 1),
  },
  {
    kind: 'exit', name: 'Palace of Darkness Big Key Door', mode: 'set',
    rule: allOf(
      hasKeys('Small Key (Palace of Darkness)', 6),
      hasItem('Big Key (Palace of Darkness)'),
      arrows,
      hasItem('Hammer'),
    ),
  },
  { kind: 'exit', name: 'Palace of Darkness (North)', mode: 'set', rule: hasKeys('Small Key (Palace of Darkness)', 4) },
  // 525-526
  {
    kind: 'location', name: 'Palace of Darkness - Big Chest', mode: 'set',
    rule: allOf(bombs, hasItem('Big Key (Palace of Darkness)')),
  },
  { kind: 'location', name: 'Palace of Darkness - The Arena - Ledge', mode: 'set', rule: bombs },
  // 531-532
  {
    kind: 'exit', name: 'Palace of Darkness Big Key Chest Staircase', mode: 'set',
    rule: allOf(bombs, anyOf(
      hasKeys('Small Key (Palace of Darkness)', 6),
      allOf(
        placedAt('Palace of Darkness - Big Key Chest', 'Small Key (Palace of Darkness)'),
        hasKeys('Small Key (Palace of Darkness)', 3),
      ),
    )),
  },
  // 536-537
  {
    kind: 'exit', name: 'Palace of Darkness Spike Statue Room Door', mode: 'set',
    rule: anyOf(
      hasKeys('Small Key (Palace of Darkness)', 6),
      allOf(
        placedAt('Palace of Darkness - Harmless Hellway', 'Small Key (Palace of Darkness)'),
        hasKeys('Small Key (Palace of Darkness)', 4),
      ),
    ),
  },
  // 541
  { kind: 'exit', name: 'Palace of Darkness Maze Door', mode: 'set', rule: hasKeys('Small Key (Palace of Darkness)', 6) },
  // dungeon_boss_rules
  { kind: 'location', name: 'Palace of Darkness - Boss', mode: 'add', rule: dungeonBossDefeat('Palace of Darkness') },
  { kind: 'location', name: 'Palace of Darkness - Prize', mode: 'add', rule: dungeonBossDefeat('Palace of Darkness') },
];

export { DARK_PALACE_RULES };
