/* @layer shared-game @kind data */
/**
 * The outcast-village hideout, from Archipelago worlds/alttp/Rules.py:
 * the pull entrance (default_rules 693), global_rules 412-423 (vanilla boss
 * → the fight door needs keys and bombs, 413-414) and the boss defeat rule.
 * The big-chest self-allowance (key-drop off only) lives in the item-rules
 * table.
 */
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../combinators';
import { canUseBombs } from '../../state-helpers';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const THIEVES_DEN_RULES: readonly RuleEntry[] = [
  // default_rules 693
  { kind: 'exit', name: 'Thieves Town', mode: 'set', rule: hasItem('Moon Pearl') },
  // 412
  { kind: 'exit', name: 'Thieves Town Big Key Door', mode: 'set', rule: hasItem('Big Key (Thieves Town)') },
  // 413-414 (vanilla boss placement)
  {
    kind: 'exit', name: 'Blind Fight', mode: 'set',
    rule: allOf(hasKeys('Small Key (Thieves Town)', 3), (state: CollectionState) => canUseBombs(state)),
  },
  // 415-416: the reference's operator precedence: 3keys OR (self-placed AND 2keys), AND hammer.
  {
    kind: 'location', name: 'Thieves\' Town - Big Chest', mode: 'set',
    rule: allOf(
      anyOf(
        hasKeys('Small Key (Thieves Town)', 3),
        allOf(
          placedAt('Thieves\' Town - Big Chest', 'Small Key (Thieves Town)'),
          hasKeys('Small Key (Thieves Town)', 2),
        ),
      ),
      hasItem('Hammer'),
    ),
  },
  // 417-418
  { kind: 'location', name: 'Thieves\' Town - Blind\'s Cell', mode: 'set', rule: hasKeys('Small Key (Thieves Town)', 1) },
  // 421-423
  { kind: 'location', name: 'Thieves\' Town - Attic', mode: 'set', rule: hasKeys('Small Key (Thieves Town)', 3) },
  {
    kind: 'location', name: 'Thieves\' Town - Spike Switch Pot Key', mode: 'set',
    rule: hasKeys('Small Key (Thieves Town)', 1),
  },
  // dungeon_boss_rules
  { kind: 'location', name: 'Thieves\' Town - Boss', mode: 'add', rule: dungeonBossDefeat('Thieves Town') },
  { kind: 'location', name: 'Thieves\' Town - Prize', mode: 'add', rule: dungeonBossDefeat('Thieves Town') },
];

export { THIEVES_DEN_RULES };
