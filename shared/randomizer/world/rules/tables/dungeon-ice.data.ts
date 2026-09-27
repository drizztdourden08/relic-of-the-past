/* @layer shared-game @kind data */
/**
 * The lake-island dungeon, from Archipelago worlds/alttp/Rules.py
 * global_rules 437-461 (swordless off; can_take_damage true collapses the
 * spike-crossing clause of the east door, 459-460) plus the boss defeat
 * rule.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, either, hasItem, hasKeys, placedIn,
} from '../combinators';
import { canLiftRocks, canMeltThings, canUseBombs } from '../../state-helpers';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (state: CollectionState): boolean => canUseBombs(state);

/** 453-458: the big key in the far side lowers the key need to four. */
const bigKeyBeyondEastDoor = placedIn(ITEM.bigKeyIcePalace, [
  'check-199',
  'check-206',
  'check-200',
  'check-201',
]);

const ICE_RULES: readonly RuleEntry[] = [
  // 437-439
  { kind: 'location', target: 'check-204', mode: 'set', rule: canMeltThings },
  {
    kind: 'location', target: 'check-195', mode: 'set',
    rule: allOf(canMeltThings, hasKeys(ITEM.smallKeyIcePalace, 1)),
  },
  {
    kind: 'exit', target: 'Ice Palace (Second Section)', mode: 'set',
    rule: allOf(canMeltThings, hasKeys(ITEM.smallKeyIcePalace, 1), bombs),
  },
  // 441-443
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
  // 453-460 (the damage-tank alternative is always available in the baseline)
  {
    kind: 'exit', target: 'Ice Palace (East)', mode: 'set',
    rule: anyOf(
      hasItem(ITEM.hookshot),
      either(
        bigKeyBeyondEastDoor,
        hasKeys(ITEM.smallKeyIcePalace, 4),
        hasKeys(ITEM.smallKeyIcePalace, 6),
      ),
    ),
  },
  // 461
  {
    kind: 'exit', target: 'Ice Palace (East Top)', mode: 'set',
    rule: allOf(canLiftRocks, hasItem(ITEM.hammer)),
  },
  // dungeon_boss_rules
  { kind: 'location', target: 'check-202', mode: 'add', rule: dungeonBossDefeat('dungeon-010') },
  { kind: 'location', target: 'check-203', mode: 'add', rule: dungeonBossDefeat('dungeon-010') },
];

export { ICE_RULES };
