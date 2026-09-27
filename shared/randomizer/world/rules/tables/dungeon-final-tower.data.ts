/* @layer shared-game @kind data */
/**
 * The final tower, from Archipelago worlds/alttp/Rules.py: the crystal gate
 * (122, since the earlier lock at 114-118 is immediately re-set and dead),
 * global_rules 543-609 (enemy shuffle off → the big-key door needs arrows,
 * 597-599; the double-switch row at 552 is re-set by 564 and only the key
 * count survives), the glitch-room hookshot requirement
 * (forbid_bomb_jump_requirements 956-959) and no_glitches_rules 918.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt, placedIn,
} from '../combinators';
import { canShootArrows, canUseBombs, hasFireSource } from '../../state-helpers';
import { canKillMostThings, hasCrystals } from '../../state-helpers-world';
import { actGate } from '../../events';
import { dungeonBossDefeat, FINAL_TOWER_SUB_BOSSES } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { LocationKey } from '../../location-key';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (state: CollectionState): boolean => canUseBombs(state);
const arrows = (state: CollectionState): boolean => canShootArrows(state);
const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

/** 544-546. */
const RANDOMIZER_ROOM_CHESTS: readonly LocationKey[] = [
  'check-249',
  'check-250',
  'check-251',
  'check-252',
];
const COMPASS_ROOM_CHESTS: readonly LocationKey[] = [
  'check-239',
  'check-240',
  'check-241',
  'check-242',
  'check-264',
];
const BACK_CHESTS: readonly LocationKey[] = [
  'check-253',
  'check-254',
  'check-255',
  'check-256',
  'check-257',
];
const DMS_ROOM_CHESTS: readonly LocationKey[] = [
  'check-243',
  'check-244',
  'check-245',
  'check-246',
];

const smallKeys = (count: number) => hasKeys(ITEM.smallKeyGanonsTower, count);
const bigKeyIn = (locations: readonly LocationKey[]) => placedIn(ITEM.bigKeyGanonsTower, locations);

const FINAL_TOWER_RULES: readonly RuleEntry[] = [
  // 122. The doors were opened once and stayed open, so the act carries the crystal count.
  { kind: 'exit', target: 'Ganons Tower', mode: 'set', rule: actGate('check-348') },
  // 548-551
  { kind: 'location', target: 'check-235', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  { kind: 'exit', target: 'Ganons Tower (Tile Room)', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  {
    kind: 'exit', target: 'Ganons Tower (Hookshot Room)', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), anyOf(hasItem(ITEM.hookshot), hasItem(ITEM.pegasusBoots))),
  },
  {
    kind: 'location', target: 'check-263', mode: 'set',
    rule: anyOf(hasItem(ITEM.caneOfSomaria), bombs),
  },
  // 552 re-set by 564; 918 adds the hookshot under no-glitches.
  { kind: 'exit', target: 'Ganons Tower (Double Switch Room)', mode: 'set', rule: smallKeys(6) },
  { kind: 'exit', target: 'Ganons Tower (Double Switch Room)', mode: 'add', rule: hasItem(ITEM.hookshot) },
  // 555-556
  {
    kind: 'exit', target: 'Ganons Tower (Map Room)', mode: 'set',
    rule: anyOf(
      smallKeys(8),
      allOf(placedAt('check-247', ITEM.bigKeyGanonsTower), smallKeys(6)),
    ),
  },
  // 566-567
  {
    kind: 'exit', target: 'Ganons Tower (Firesnake Room)', mode: 'set',
    rule: anyOf(
      smallKeys(7),
      allOf(bigKeyIn([...RANDOMIZER_ROOM_CHESTS, ...BACK_CHESTS]), smallKeys(5)),
    ),
  },
  // 570-571
  {
    kind: 'location', target: 'check-248', mode: 'set',
    rule: anyOf(
      smallKeys(7),
      allOf(
        anyOf(
          bigKeyIn(RANDOMIZER_ROOM_CHESTS),
          placedAt('check-248', ITEM.smallKeyGanonsTower),
        ),
        smallKeys(5),
      ),
    ),
  },
  // 572-574
  ...RANDOMIZER_ROOM_CHESTS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set',
    rule: allOf(bombs, anyOf(smallKeys(8), allOf(bigKeyIn(RANDOMIZER_ROOM_CHESTS), smallKeys(6)))),
  })),
  // 577-578
  {
    kind: 'exit', target: 'Ganons Tower (Tile Room) Key Door', mode: 'set',
    rule: allOf(
      hasItem(ITEM.fireRod),
      anyOf(smallKeys(7), allOf(bigKeyIn(COMPASS_ROOM_CHESTS), smallKeys(5))),
    ),
  },
  // 579-580
  {
    kind: 'exit', target: 'Ganons Tower (Bottom) (East)', mode: 'set',
    rule: anyOf(smallKeys(7), allOf(bigKeyIn(BACK_CHESTS), smallKeys(5))),
  },
  // 582-584
  ...COMPASS_ROOM_CHESTS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set',
    rule: allOf(
      anyOf(bombs, hasItem(ITEM.caneOfSomaria)),
      hasItem(ITEM.fireRod),
      anyOf(smallKeys(7), allOf(bigKeyIn(COMPASS_ROOM_CHESTS), smallKeys(5))),
    ),
  })),
  // 586
  { kind: 'location', target: 'check-254', mode: 'set', rule: hasItem(ITEM.bigKeyGanonsTower) },
  // 588-593: the bottom fight guards the big-key room.
  ...['check-255', 'check-257',
    'check-256'].map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set', rule: allOf(bombs, FINAL_TOWER_SUB_BOSSES.bottom),
  })),
  // 597-599
  {
    kind: 'exit', target: 'Ganons Tower Big Key Door', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeyGanonsTower), arrows),
  },
  // 600-601: the middle fight guards the torch climb.
  {
    kind: 'exit', target: 'Ganons Tower Torch Rooms', mode: 'set',
    rule: allOf(kill(8), hasFireSource, FINAL_TOWER_SUB_BOSSES.middle),
  },
  // 602-606
  { kind: 'location', target: 'check-265', mode: 'set', rule: kill(1) },
  {
    kind: 'location', target: 'check-260', mode: 'set',
    rule: allOf(smallKeys(7), bombs),
  },
  { kind: 'exit', target: 'Ganons Tower Moldorm Door', mode: 'set', rule: allOf(smallKeys(8), bombs) },
  // 607-608: the top fight guards the gap.
  {
    kind: 'exit', target: 'Ganons Tower Moldorm Gap', mode: 'set',
    rule: allOf(hasItem(ITEM.hookshot), FINAL_TOWER_SUB_BOSSES.top),
  },
  // 609: the second tower fight.
  { kind: 'location', target: 'check-349', mode: 'add', rule: dungeonBossDefeat('dungeon-013') },
  // forbid_bomb_jump_requirements 957-959
  ...DMS_ROOM_CHESTS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'add', rule: hasItem(ITEM.hookshot),
  })),
];

export { FINAL_TOWER_RULES };
