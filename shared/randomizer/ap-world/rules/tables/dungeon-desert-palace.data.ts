/* @layer shared-game @kind data */
/**
 * The desert palace, from tests/fixtures/ap-source/Rules.py: the book
 * entrance and outer rocks (default_rules 640, 659-660), the interior
 * (global_rules 360-372; the reward-placement guard 370-372 is asked of the
 * world, since it exists only while a key family is still pinned to its own
 * dungeon).
 */
import {
  allOf, hasItem, hasKeys,
} from '../combinators';
import { canLiftRocks, hasFireSource } from '../../state-helpers';
import { canKillMostThings } from '../../state-helpers-world';
import { DEFAULT_DUNGEON_ITEM_SETTING, staysInOwnDungeon } from '../../dungeon-items/dungeon-item-modes';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { ApWorld } from '../../world.type';
import type { RuleEntry } from '../rule-entry.type';

const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

/** True while at least one key family is still pinned to the dungeon that owns it. */
const eitherKeyFamilyPinned = (world: ApWorld): boolean => {
  const setting = world.options.dungeonItems ?? DEFAULT_DUNGEON_ITEM_SETTING;
  return staysInOwnDungeon(setting.smallKey) || staysInOwnDungeon(setting.bigKey);
};

/** 367-368: full keys + big key + a fire source + the boss fight. */
const bossAccess = allOf(
  hasKeys('Small Key (Desert Palace)', 4),
  hasItem('Big Key (Desert Palace)'),
  hasFireSource,
  dungeonBossDefeat('Desert Palace'),
);

const DESERT_PALACE_RULES: readonly RuleEntry[] = [
  // default_rules 640, 659-660
  { kind: 'exit', name: 'Desert Palace Stairs', mode: 'set', rule: hasItem('Book of Mudora') },
  { kind: 'exit', name: 'Desert Palace Entrance (North) Rocks', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', name: 'Desert Ledge Return Rocks', mode: 'set', rule: canLiftRocks },
  // 360-361
  {
    kind: 'location', name: 'Desert Palace - Big Chest', mode: 'set',
    rule: hasItem('Big Key (Desert Palace)'),
  },
  { kind: 'location', name: 'Desert Palace - Torch', mode: 'set', rule: hasItem('Pegasus Boots') },
  // 363-366
  { kind: 'exit', name: 'Desert Palace East Wing', mode: 'set', rule: hasKeys('Small Key (Desert Palace)', 4) },
  { kind: 'location', name: 'Desert Palace - Big Key Chest', mode: 'set', rule: kill(3) },
  {
    kind: 'location', name: 'Desert Palace - Beamos Hall Pot Key', mode: 'set',
    rule: allOf(hasKeys('Small Key (Desert Palace)', 2), kill(4)),
  },
  {
    kind: 'location', name: 'Desert Palace - Desert Tiles 2 Pot Key', mode: 'set',
    rule: allOf(hasKeys('Small Key (Desert Palace)', 3), kill(4)),
  },
  // 367-368
  { kind: 'location', name: 'Desert Palace - Boss', mode: 'add', rule: bossAccess },
  { kind: 'location', name: 'Desert Palace - Prize', mode: 'add', rule: bossAccess },
  // 370-372: the prize must not lock the keys needed to reach it. Guarded by
  // `not (small_key_shuffle and big_key_shuffle)` — a Choice is falsy only at
  // value 0, so the guard drops only once BOTH key families have left their own
  // dungeon, at which point neither key can be locked behind this prize.
  {
    kind: 'location', name: 'Desert Palace - Prize', mode: 'add',
    rule: (state) => !eitherKeyFamilyPinned(state.world) || state.canReachRegion('Desert Palace Main (Outer)'),
  },
];

export { DESERT_PALACE_RULES };
