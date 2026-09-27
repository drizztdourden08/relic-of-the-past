/* @layer shared-game @kind data */
/**
 * The outcast-village hideout, from Archipelago worlds/alttp/Rules.py:
 * the pull entrance (default_rules 693), global_rules 412-423 (vanilla boss
 * → the fight door needs keys and bombs, 413-414) and the boss defeat rule.
 * The big-chest self-allowance (key-drop off only) lives in the item-rules
 * table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../combinators';
import { canUseBombs } from '../../state-helpers';
import { actGate } from '../../events';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const THIEVES_DEN_RULES: readonly RuleEntry[] = [
  // default_rules 693, plus the door itself: the way in is a door somebody already pulled
  // open with the gloves, and the act's own record carries that. Nothing in an inventory
  // says whether it was pulled, so a world with no record to read keeps the old answer.
  { kind: 'exit', target: 'Thieves Town', mode: 'set', rule: allOf(hasItem(ITEM.moonPearl), actGate('check-333')) },
  // 412
  { kind: 'exit', target: 'Thieves Town Big Key Door', mode: 'set', rule: hasItem(ITEM.bigKeyThievesTown) },
  // 413-414 (vanilla boss placement)
  {
    kind: 'exit', target: 'Blind Fight', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyThievesTown, 3), (state: CollectionState) => canUseBombs(state)),
  },
  // 415-416: the reference's operator precedence: 3keys OR (self-placed AND 2keys), AND hammer.
  {
    kind: 'location', target: 'check-178', mode: 'set',
    rule: allOf(
      anyOf(
        hasKeys(ITEM.smallKeyThievesTown, 3),
        allOf(
          placedAt('check-178', ITEM.smallKeyThievesTown),
          hasKeys(ITEM.smallKeyThievesTown, 2),
        ),
      ),
      hasItem(ITEM.hammer),
    ),
  },
  // 417-418
  { kind: 'location', target: 'check-179', mode: 'set', rule: hasKeys(ITEM.smallKeyThievesTown, 1) },
  // 421-423
  { kind: 'location', target: 'check-177', mode: 'set', rule: hasKeys(ITEM.smallKeyThievesTown, 3) },
  {
    kind: 'location', target: 'check-183', mode: 'set',
    rule: hasKeys(ITEM.smallKeyThievesTown, 1),
  },
  // dungeon_boss_rules
  { kind: 'location', target: 'check-180', mode: 'add', rule: dungeonBossDefeat('dungeon-009') },
  { kind: 'location', target: 'check-181', mode: 'add', rule: dungeonBossDefeat('dungeon-009') },
];

export { THIEVES_DEN_RULES };
