/* @layer shared-game @kind data */
/**
 * The lake-island dungeon, from tests/fixtures/ap-source/Rules.py
 * global_rules 437-461 (swordless off; can_take_damage true collapses the
 * spike-crossing clause of the east door, 459-460) plus the boss defeat
 * rule.
 */
import {
  allOf, anyOf, either, hasItem, hasKeys, placedIn,
} from '../combinators';
import { canLiftRocks, canMeltThings, canUseBombs } from '../../state-helpers';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (state: CollectionState): boolean => canUseBombs(state);

/** 453-458: the big key in the far side lowers the key need to four. */
const bigKeyBeyondEastDoor = placedIn('Big Key (Ice Palace)', [
  'Ice Palace - Spike Room',
  'Ice Palace - Hammer Block Key Drop',
  'Ice Palace - Big Key Chest',
  'Ice Palace - Map Chest',
]);

const ICE_RULES: readonly RuleEntry[] = [
  // 437-439
  { kind: 'location', name: 'Ice Palace - Jelly Key Drop', mode: 'set', rule: canMeltThings },
  {
    kind: 'location', name: 'Ice Palace - Compass Chest', mode: 'set',
    rule: allOf(canMeltThings, hasKeys('Small Key (Ice Palace)', 1)),
  },
  {
    kind: 'exit', name: 'Ice Palace (Second Section)', mode: 'set',
    rule: allOf(canMeltThings, hasKeys('Small Key (Ice Palace)', 1), bombs),
  },
  // 441-443
  { kind: 'exit', name: 'Ice Palace (Main)', mode: 'set', rule: hasKeys('Small Key (Ice Palace)', 2) },
  { kind: 'location', name: 'Ice Palace - Big Chest', mode: 'set', rule: hasItem('Big Key (Ice Palace)') },
  {
    kind: 'exit', name: 'Ice Palace (Kholdstare)', mode: 'set',
    rule: allOf(
      canLiftRocks,
      hasItem('Hammer'),
      hasItem('Big Key (Ice Palace)'),
      anyOf(
        hasKeys('Small Key (Ice Palace)', 6),
        allOf(hasItem('Cane of Somaria'), hasKeys('Small Key (Ice Palace)', 5)),
      ),
    ),
  },
  // 453-460 (the damage-tank alternative is always available in the baseline)
  {
    kind: 'exit', name: 'Ice Palace (East)', mode: 'set',
    rule: anyOf(
      hasItem('Hookshot'),
      either(
        bigKeyBeyondEastDoor,
        hasKeys('Small Key (Ice Palace)', 4),
        hasKeys('Small Key (Ice Palace)', 6),
      ),
    ),
  },
  // 461
  {
    kind: 'exit', name: 'Ice Palace (East Top)', mode: 'set',
    rule: allOf(canLiftRocks, hasItem('Hammer')),
  },
  // dungeon_boss_rules
  { kind: 'location', name: 'Ice Palace - Boss', mode: 'add', rule: dungeonBossDefeat('Ice Palace') },
  { kind: 'location', name: 'Ice Palace - Prize', mode: 'add', rule: dungeonBossDefeat('Ice Palace') },
];

export { ICE_RULES };
