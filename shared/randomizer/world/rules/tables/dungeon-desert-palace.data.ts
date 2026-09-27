/* @layer shared-game @kind data */
/**
 * The desert palace, from Archipelago worlds/alttp/Rules.py: the book
 * entrance and outer rocks (default_rules 640, 659-660), the interior
 * (global_rules 360-372; the reward-placement guard 370-372 is asked of the
 * world, since it exists only while a key family is still pinned to its own
 * dungeon).
 */
import { ITEM } from '../../item-ids.data';
import { REGION } from '../../region-ids.data';
import {
  allOf, hasItem, hasKeys,
} from '../combinators';
import { canLiftRocks, hasFireSource } from '../../state-helpers';
import { actGate } from '../../events';
import { canKillMostThings } from '../../state-helpers-world';
import { DEFAULT_DUNGEON_ITEM_SETTING, staysInOwnDungeon } from '../../dungeon-items/dungeon-item-modes';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { World } from '../../world.type';
import type { RuleEntry } from '../rule-entry.type';

const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

/** True while at least one key family is still pinned to the dungeon that owns it. */
const eitherKeyFamilyPinned = (world: World): boolean => {
  const setting = world.options.dungeonItems ?? DEFAULT_DUNGEON_ITEM_SETTING;
  return staysInOwnDungeon(setting.smallKey) || staysInOwnDungeon(setting.bigKey);
};

/** 367-368: full keys + big key + a fire source + the boss fight. */
const bossAccess = allOf(
  hasKeys(ITEM.smallKeyDesertPalace, 4),
  hasItem(ITEM.bigKeyDesertPalace),
  hasFireSource,
  dungeonBossDefeat('dungeon-004'),
);

const DESERT_PALACE_RULES: readonly RuleEntry[] = [
  // default_rules 640, 659-660. The stairs are open because the prayer was said, and the
  // book is what says it, so the act carries the book and the stairs ask for the act.
  { kind: 'exit', target: 'Desert Palace Stairs', mode: 'set', rule: actGate('check-353') },
  { kind: 'exit', target: 'Desert Palace Entrance (North) Rocks', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Desert Ledge Return Rocks', mode: 'set', rule: canLiftRocks },
  // 360-361
  {
    kind: 'location', target: 'check-125', mode: 'set',
    rule: hasItem(ITEM.bigKeyDesertPalace),
  },
  { kind: 'location', target: 'check-126', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  // 363-366
  { kind: 'exit', target: 'Desert Palace East Wing', mode: 'set', rule: hasKeys(ITEM.smallKeyDesertPalace, 4) },
  { kind: 'location', target: 'check-129', mode: 'set', rule: kill(3) },
  {
    kind: 'location', target: 'check-133', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyDesertPalace, 2), kill(4)),
  },
  {
    kind: 'location', target: 'check-134', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeyDesertPalace, 3), kill(4)),
  },
  // 367-368
  { kind: 'location', target: 'check-130', mode: 'add', rule: bossAccess },
  { kind: 'location', target: 'check-131', mode: 'add', rule: bossAccess },
  // 370-372: the prize must not lock the keys needed to reach it. Guarded by
  // `not (small_key_shuffle and big_key_shuffle)`: a Choice is falsy only at
  // value 0, so the guard drops only once BOTH key families have left their own
  // dungeon, at which point neither key can be locked behind this prize.
  {
    kind: 'location', target: 'check-131', mode: 'add',
    rule: (state) => !eitherKeyFamilyPinned(state.world) || state.canReachRegion(REGION.desertPalaceOuter),
  },
];

export { DESERT_PALACE_RULES };
