/* @layer shared-game @kind data */
/**
 * The swamp palace, from tests/fixtures/ap-source/Rules.py: global_rules
 * 390-410 (pot shuffle off → 396-398 and 408-410 skipped) plus the moat
 * mirror requirement (109-110: the swamp was not moved, entrance shuffle is
 * vanilla) and the boss defeat rule. The big-key forbid and self-allowance
 * live in the item-rules table.
 */
import {
  allOf, hasItem, hasKeys,
} from '../combinators';
import { canUseBombs } from '../../state-helpers';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const SWAMP_RULES: readonly RuleEntry[] = [
  // 390, then 109-110 adds the mirror (unmoved swamp under no-glitches).
  {
    kind: 'exit', name: 'Swamp Palace Moat', mode: 'set',
    rule: allOf(hasItem('Flippers'), hasItem('Open Floodgate')),
  },
  { kind: 'exit', name: 'Swamp Palace Moat', mode: 'add', rule: hasItem('Magic Mirror') },
  // 391-395
  { kind: 'exit', name: 'Swamp Palace Small Key Door', mode: 'set', rule: hasKeys('Small Key (Swamp Palace)', 1) },
  { kind: 'location', name: 'Swamp Palace - Map Chest', mode: 'set', rule: (state: CollectionState) => canUseBombs(state) },
  { kind: 'location', name: 'Swamp Palace - Trench 1 Pot Key', mode: 'set', rule: hasKeys('Small Key (Swamp Palace)', 2) },
  {
    kind: 'exit', name: 'Swamp Palace (Center)', mode: 'set',
    rule: allOf(hasItem('Hammer'), hasKeys('Small Key (Swamp Palace)', 3)),
  },
  { kind: 'location', name: 'Swamp Palace - Hookshot Pot Key', mode: 'set', rule: hasItem('Hookshot') },
  // 399-403
  { kind: 'exit', name: 'Swamp Palace (West)', mode: 'set', rule: hasKeys('Small Key (Swamp Palace)', 6) },
  { kind: 'location', name: 'Swamp Palace - Big Chest', mode: 'set', rule: hasItem('Big Key (Swamp Palace)') },
  {
    kind: 'exit', name: 'Swamp Palace (North)', mode: 'set',
    rule: allOf(hasItem('Hookshot'), hasKeys('Small Key (Swamp Palace)', 5)),
  },
  // dungeon_boss_rules, then 406-407 add the full key count.
  { kind: 'location', name: 'Swamp Palace - Boss', mode: 'add', rule: dungeonBossDefeat('Swamp Palace') },
  { kind: 'location', name: 'Swamp Palace - Prize', mode: 'add', rule: dungeonBossDefeat('Swamp Palace') },
  { kind: 'location', name: 'Swamp Palace - Boss', mode: 'add', rule: hasKeys('Small Key (Swamp Palace)', 6) },
  { kind: 'location', name: 'Swamp Palace - Prize', mode: 'add', rule: hasKeys('Small Key (Swamp Palace)', 6) },
];

export { SWAMP_RULES };
