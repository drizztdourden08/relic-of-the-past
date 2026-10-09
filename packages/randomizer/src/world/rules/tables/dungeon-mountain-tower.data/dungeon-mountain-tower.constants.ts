/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../../combinators';
import {
  arrows, canActivateCrystalSwitch, hasFireSource, hasMeleeWeapon,
} from '../../helper-rules';
import { dungeonBossDefeat } from '../bosses.data';
import type { RuleEntry } from '../../rule-entry.type';

const MOUNTAIN_TOWER_RULES: readonly RuleEntry[] = [
  {
    kind: 'location', target: 'check-135', mode: 'set',
    rule: canActivateCrystalSwitch,
  },
  { kind: 'location', target: 'check-136', mode: 'set', rule: canActivateCrystalSwitch },
  {
    kind: 'exit', target: 'Tower of Hera Small Key Door', mode: 'set',
    rule: allOf(canActivateCrystalSwitch, anyOf(
      hasKeys(ITEM.smallKeyTowerOfHera, 1),
      placedAt('check-137', ITEM.smallKeyTowerOfHera),
    )),
  },
  {
    kind: 'exit', target: 'Tower of Hera Big Key Door', mode: 'set',
    rule: allOf(canActivateCrystalSwitch, hasItem(ITEM.bigKeyTowerOfHera)),
  },
  {
    kind: 'exit', target: 'Tower of Hera Big Key Door', mode: 'add',
    rule: anyOf(
      hasMeleeWeapon,
      allOf(hasItem(ITEM.silverBow), arrows()),
      hasItem(ITEM.caneOfByrna),
      hasItem(ITEM.caneOfSomaria),
    ),
  },
  { kind: 'location', target: 'check-139', mode: 'set', rule: hasItem(ITEM.bigKeyTowerOfHera) },
  { kind: 'location', target: 'check-137', mode: 'set', rule: hasFireSource },
  { kind: 'location', target: 'check-140', mode: 'add', rule: dungeonBossDefeat('dungeon-005') },
  { kind: 'location', target: 'check-141', mode: 'add', rule: dungeonBossDefeat('dungeon-005') },
];

export { MOUNTAIN_TOWER_RULES };
