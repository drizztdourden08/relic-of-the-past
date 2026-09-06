/* @layer shared-game @kind data */
/**
 * The mountaintop tower, from Archipelago worlds/alttp/Rules.py global_rules
 * 374-388 (enemy shuffle off → the big-key door needs a real weapon,
 * 380-384) plus the boss defeat rule from dungeon_boss_rules. The small-key
 * self-allowance lives in the item-rules table.
 */
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../combinators';
import { canShootArrows, hasFireSource, hasMeleeWeapon } from '../../state-helpers';
import { canActivateCrystalSwitch } from '../../state-helpers-world';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const MOUNTAIN_TOWER_RULES: readonly RuleEntry[] = [
  // 374-375
  {
    kind: 'location', name: 'Tower of Hera - Basement Cage', mode: 'set',
    rule: canActivateCrystalSwitch,
  },
  { kind: 'location', name: 'Tower of Hera - Map Chest', mode: 'set', rule: canActivateCrystalSwitch },
  // 376
  {
    kind: 'exit', name: 'Tower of Hera Small Key Door', mode: 'set',
    rule: allOf(canActivateCrystalSwitch, anyOf(
      hasKeys('Small Key (Tower of Hera)', 1),
      placedAt('Tower of Hera - Big Key Chest', 'Small Key (Tower of Hera)'),
    )),
  },
  // 377 then 380-384
  {
    kind: 'exit', name: 'Tower of Hera Big Key Door', mode: 'set',
    rule: allOf(canActivateCrystalSwitch, hasItem('Big Key (Tower of Hera)')),
  },
  {
    kind: 'exit', name: 'Tower of Hera Big Key Door', mode: 'add',
    rule: anyOf(
      hasMeleeWeapon,
      allOf(hasItem('Silver Bow'), (state: CollectionState) => canShootArrows(state)),
      hasItem('Cane of Byrna'),
      hasItem('Cane of Somaria'),
    ),
  },
  // 385-386
  { kind: 'location', name: 'Tower of Hera - Big Chest', mode: 'set', rule: hasItem('Big Key (Tower of Hera)') },
  { kind: 'location', name: 'Tower of Hera - Big Key Chest', mode: 'set', rule: hasFireSource },
  // dungeon_boss_rules
  { kind: 'location', name: 'Tower of Hera - Boss', mode: 'add', rule: dungeonBossDefeat('Tower of Hera') },
  { kind: 'location', name: 'Tower of Hera - Prize', mode: 'add', rule: dungeonBossDefeat('Tower of Hera') },
];

export { MOUNTAIN_TOWER_RULES };
