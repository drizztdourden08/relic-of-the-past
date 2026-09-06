/* @layer shared-game @kind data */
/**
 * The swamp-of-despair dungeon, from tests/fixtures/ap-source/Rules.py:
 * the medallion entrance (default_rules 716 — sword required to cast, the
 * per-seed medallion resolved through the world options), global_rules
 * 463-488 (can_take_damage true keeps the hearts alternative live) and the
 * boss defeat rule. The vitreous-room lamp comes from the lamp table.
 */
import {
  allOf, anyOf, either, hasItem, hasKeys, placedAt,
} from '../combinators';
import { canShootArrows, canUseBombs, hasFireSource, hasHearts, hasSword } from '../../state-helpers';
import { canActivateCrystalSwitch, canUseMedallion, hasMireMedallion } from '../../state-helpers-world';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

/** 478-482: a key placed west is safe only when the big key locks it. */
const bigKeyLocksWest = anyOf(
  placedAt('Misery Mire - Compass Chest', 'Big Key (Misery Mire)'),
  placedAt('Misery Mire - Big Key Chest', 'Big Key (Misery Mire)'),
);

const MIRE_RULES: readonly RuleEntry[] = [
  // default_rules 716
  {
    kind: 'exit', name: 'Misery Mire', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), canUseMedallion, hasMireMedallion),
  },
  // 463
  {
    kind: 'exit', name: 'Misery Mire Entrance Gap', mode: 'set',
    rule: allOf(
      anyOf(hasItem('Pegasus Boots'), hasItem('Hookshot')),
      anyOf(
        hasSword, hasItem('Fire Rod'), hasItem('Ice Rod'), hasItem('Hammer'),
        hasItem('Cane of Somaria'), (state: CollectionState) => canShootArrows(state),
      ),
    ),
  },
  // 464-468
  {
    kind: 'location', name: 'Misery Mire - Fishbone Pot Key', mode: 'set',
    rule: anyOf(hasItem('Big Key (Misery Mire)'), hasKeys('Small Key (Misery Mire)', 4)),
  },
  { kind: 'location', name: 'Misery Mire - Big Chest', mode: 'set', rule: hasItem('Big Key (Misery Mire)') },
  {
    kind: 'location', name: 'Misery Mire - Spike Chest', mode: 'set',
    rule: anyOf(
      (state: CollectionState) => hasHearts(state, 4),
      hasItem('Cane of Byrna'),
      hasItem('Cape'),
    ),
  },
  { kind: 'exit', name: 'Misery Mire Big Key Door', mode: 'set', rule: hasItem('Big Key (Misery Mire)') },
  // 470-476
  {
    kind: 'location', name: 'Misery Mire - Map Chest', mode: 'set',
    rule: anyOf(
      allOf(hasKeys('Small Key (Misery Mire)', 2), canActivateCrystalSwitch),
      hasKeys('Small Key (Misery Mire)', 4),
    ),
  },
  {
    kind: 'location', name: 'Misery Mire - Main Lobby', mode: 'set',
    rule: anyOf(
      allOf(hasKeys('Small Key (Misery Mire)', 3), canActivateCrystalSwitch),
      hasKeys('Small Key (Misery Mire)', 5),
    ),
  },
  // 478-482
  {
    kind: 'location', name: 'Misery Mire - Conveyor Crystal Key Drop', mode: 'set',
    rule: either(
      anyOf(bigKeyLocksWest, placedAt('Misery Mire - Conveyor Crystal Key Drop', 'Big Key (Misery Mire)')),
      hasKeys('Small Key (Misery Mire)', 4),
      hasKeys('Small Key (Misery Mire)', 5),
    ),
  },
  // 483-485
  {
    kind: 'exit', name: 'Misery Mire (West)', mode: 'set',
    rule: either(
      bigKeyLocksWest,
      hasKeys('Small Key (Misery Mire)', 5),
      hasKeys('Small Key (Misery Mire)', 6),
    ),
  },
  // 486-488
  { kind: 'location', name: 'Misery Mire - Compass Chest', mode: 'set', rule: hasFireSource },
  { kind: 'location', name: 'Misery Mire - Big Key Chest', mode: 'set', rule: hasFireSource },
  {
    kind: 'exit', name: 'Misery Mire (Vitreous)', mode: 'set',
    rule: allOf(hasItem('Cane of Somaria'), (state: CollectionState) => canUseBombs(state)),
  },
  // dungeon_boss_rules
  { kind: 'location', name: 'Misery Mire - Boss', mode: 'add', rule: dungeonBossDefeat('Misery Mire') },
  { kind: 'location', name: 'Misery Mire - Prize', mode: 'add', rule: dungeonBossDefeat('Misery Mire') },
];

export { MIRE_RULES };
