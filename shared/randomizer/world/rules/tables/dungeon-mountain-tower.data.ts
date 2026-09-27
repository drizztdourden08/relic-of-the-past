/* @layer shared-game @kind data */
/**
 * The mountaintop tower, from Archipelago worlds/alttp/Rules.py global_rules
 * 374-388 (enemy shuffle off → the big-key door needs a real weapon,
 * 380-384) plus the boss defeat rule from dungeon_boss_rules. The small-key
 * self-allowance lives in the item-rules table.
 */
import { ITEM } from '../../item-ids.data';
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
    kind: 'location', target: 'check-135', mode: 'set',
    rule: canActivateCrystalSwitch,
  },
  { kind: 'location', target: 'check-136', mode: 'set', rule: canActivateCrystalSwitch },
  // 376
  {
    kind: 'exit', target: 'Tower of Hera Small Key Door', mode: 'set',
    rule: allOf(canActivateCrystalSwitch, anyOf(
      hasKeys(ITEM.smallKeyTowerOfHera, 1),
      placedAt('check-137', ITEM.smallKeyTowerOfHera),
    )),
  },
  // 377 then 380-384
  {
    kind: 'exit', target: 'Tower of Hera Big Key Door', mode: 'set',
    rule: allOf(canActivateCrystalSwitch, hasItem(ITEM.bigKeyTowerOfHera)),
  },
  {
    kind: 'exit', target: 'Tower of Hera Big Key Door', mode: 'add',
    rule: anyOf(
      hasMeleeWeapon,
      allOf(hasItem(ITEM.silverBow), (state: CollectionState) => canShootArrows(state)),
      hasItem(ITEM.caneOfByrna),
      hasItem(ITEM.caneOfSomaria),
    ),
  },
  // 385-386
  { kind: 'location', target: 'check-139', mode: 'set', rule: hasItem(ITEM.bigKeyTowerOfHera) },
  { kind: 'location', target: 'check-137', mode: 'set', rule: hasFireSource },
  // dungeon_boss_rules
  { kind: 'location', target: 'check-140', mode: 'add', rule: dungeonBossDefeat('dungeon-005') },
  { kind: 'location', target: 'check-141', mode: 'add', rule: dungeonBossDefeat('dungeon-005') },
];

export { MOUNTAIN_TOWER_RULES };
