/* @layer shared-game @kind data */
/**
 * The final tower, from Archipelago worlds/alttp/Rules.py: the crystal gate
 * (122 — the earlier lock at 114-118 is immediately re-set and dead),
 * global_rules 543-609 (enemy shuffle off → the big-key door needs arrows,
 * 597-599; the double-switch row at 552 is re-set by 564 and only the key
 * count survives), the glitch-room hookshot requirement
 * (forbid_bomb_jump_requirements 956-959) and no_glitches_rules 918.
 */
import {
  allOf, anyOf, hasItem, hasKeys, placedAt, placedIn,
} from '../combinators';
import { canShootArrows, canUseBombs, hasFireSource } from '../../state-helpers';
import { canKillMostThings, hasCrystals } from '../../state-helpers-world';
import { dungeonBossDefeat, FINAL_TOWER_SUB_BOSSES } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (state: CollectionState): boolean => canUseBombs(state);
const arrows = (state: CollectionState): boolean => canShootArrows(state);
const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

/** 544-546. */
const RANDOMIZER_ROOM_CHESTS: readonly string[] = [
  'Ganons Tower - Randomizer Room - Top Left',
  'Ganons Tower - Randomizer Room - Top Right',
  'Ganons Tower - Randomizer Room - Bottom Left',
  'Ganons Tower - Randomizer Room - Bottom Right',
];
const COMPASS_ROOM_CHESTS: readonly string[] = [
  'Ganons Tower - Compass Room - Top Left',
  'Ganons Tower - Compass Room - Top Right',
  'Ganons Tower - Compass Room - Bottom Left',
  'Ganons Tower - Compass Room - Bottom Right',
  'Ganons Tower - Conveyor Star Pits Pot Key',
];
const BACK_CHESTS: readonly string[] = [
  'Ganons Tower - Bob\'s Chest',
  'Ganons Tower - Big Chest',
  'Ganons Tower - Big Key Room - Left',
  'Ganons Tower - Big Key Room - Right',
  'Ganons Tower - Big Key Chest',
];
const DMS_ROOM_CHESTS: readonly string[] = [
  'Ganons Tower - DMs Room - Top Left',
  'Ganons Tower - DMs Room - Top Right',
  'Ganons Tower - DMs Room - Bottom Left',
  'Ganons Tower - DMs Room - Bottom Right',
];

const smallKeys = (count: number) => hasKeys('Small Key (Ganons Tower)', count);
const bigKeyIn = (locations: readonly string[]) => placedIn('Big Key (Ganons Tower)', locations);

const FINAL_TOWER_RULES: readonly RuleEntry[] = [
  // 122
  { kind: 'exit', name: 'Ganons Tower', mode: 'set', rule: (state) => hasCrystals(state, 7) },
  // 548-551
  { kind: 'location', name: 'Ganons Tower - Bob\'s Torch', mode: 'set', rule: hasItem('Pegasus Boots') },
  { kind: 'exit', name: 'Ganons Tower (Tile Room)', mode: 'set', rule: hasItem('Cane of Somaria') },
  {
    kind: 'exit', name: 'Ganons Tower (Hookshot Room)', mode: 'set',
    rule: allOf(hasItem('Hammer'), anyOf(hasItem('Hookshot'), hasItem('Pegasus Boots'))),
  },
  {
    kind: 'location', name: 'Ganons Tower - Double Switch Pot Key', mode: 'set',
    rule: anyOf(hasItem('Cane of Somaria'), bombs),
  },
  // 552 re-set by 564; 918 adds the hookshot under no-glitches.
  { kind: 'exit', name: 'Ganons Tower (Double Switch Room)', mode: 'set', rule: smallKeys(6) },
  { kind: 'exit', name: 'Ganons Tower (Double Switch Room)', mode: 'add', rule: hasItem('Hookshot') },
  // 555-556
  {
    kind: 'exit', name: 'Ganons Tower (Map Room)', mode: 'set',
    rule: anyOf(
      smallKeys(8),
      allOf(placedAt('Ganons Tower - Map Chest', 'Big Key (Ganons Tower)'), smallKeys(6)),
    ),
  },
  // 566-567
  {
    kind: 'exit', name: 'Ganons Tower (Firesnake Room)', mode: 'set',
    rule: anyOf(
      smallKeys(7),
      allOf(bigKeyIn([...RANDOMIZER_ROOM_CHESTS, ...BACK_CHESTS]), smallKeys(5)),
    ),
  },
  // 570-571
  {
    kind: 'location', name: 'Ganons Tower - Firesnake Room', mode: 'set',
    rule: anyOf(
      smallKeys(7),
      allOf(
        anyOf(
          bigKeyIn(RANDOMIZER_ROOM_CHESTS),
          placedAt('Ganons Tower - Firesnake Room', 'Small Key (Ganons Tower)'),
        ),
        smallKeys(5),
      ),
    ),
  },
  // 572-574
  ...RANDOMIZER_ROOM_CHESTS.map((name): RuleEntry => ({
    kind: 'location', name, mode: 'set',
    rule: allOf(bombs, anyOf(smallKeys(8), allOf(bigKeyIn(RANDOMIZER_ROOM_CHESTS), smallKeys(6)))),
  })),
  // 577-578
  {
    kind: 'exit', name: 'Ganons Tower (Tile Room) Key Door', mode: 'set',
    rule: allOf(
      hasItem('Fire Rod'),
      anyOf(smallKeys(7), allOf(bigKeyIn(COMPASS_ROOM_CHESTS), smallKeys(5))),
    ),
  },
  // 579-580
  {
    kind: 'exit', name: 'Ganons Tower (Bottom) (East)', mode: 'set',
    rule: anyOf(smallKeys(7), allOf(bigKeyIn(BACK_CHESTS), smallKeys(5))),
  },
  // 582-584
  ...COMPASS_ROOM_CHESTS.map((name): RuleEntry => ({
    kind: 'location', name, mode: 'set',
    rule: allOf(
      anyOf(bombs, hasItem('Cane of Somaria')),
      hasItem('Fire Rod'),
      anyOf(smallKeys(7), allOf(bigKeyIn(COMPASS_ROOM_CHESTS), smallKeys(5))),
    ),
  })),
  // 586
  { kind: 'location', name: 'Ganons Tower - Big Chest', mode: 'set', rule: hasItem('Big Key (Ganons Tower)') },
  // 588-593: the bottom fight guards the big-key room.
  ...['Ganons Tower - Big Key Room - Left', 'Ganons Tower - Big Key Chest',
    'Ganons Tower - Big Key Room - Right'].map((name): RuleEntry => ({
    kind: 'location', name, mode: 'set', rule: allOf(bombs, FINAL_TOWER_SUB_BOSSES.bottom),
  })),
  // 597-599
  {
    kind: 'exit', name: 'Ganons Tower Big Key Door', mode: 'set',
    rule: allOf(hasItem('Big Key (Ganons Tower)'), arrows),
  },
  // 600-601: the middle fight guards the torch climb.
  {
    kind: 'exit', name: 'Ganons Tower Torch Rooms', mode: 'set',
    rule: allOf(kill(8), hasFireSource, FINAL_TOWER_SUB_BOSSES.middle),
  },
  // 602-606
  { kind: 'location', name: 'Ganons Tower - Mini Helmasaur Key Drop', mode: 'set', rule: kill(1) },
  {
    kind: 'location', name: 'Ganons Tower - Pre-Moldorm Chest', mode: 'set',
    rule: allOf(smallKeys(7), bombs),
  },
  { kind: 'exit', name: 'Ganons Tower Moldorm Door', mode: 'set', rule: allOf(smallKeys(8), bombs) },
  // 607-608: the top fight guards the gap.
  {
    kind: 'exit', name: 'Ganons Tower Moldorm Gap', mode: 'set',
    rule: allOf(hasItem('Hookshot'), FINAL_TOWER_SUB_BOSSES.top),
  },
  // 609: the second tower fight.
  { kind: 'location', name: 'Agahnim 2', mode: 'add', rule: dungeonBossDefeat('Ganons Tower') },
  // forbid_bomb_jump_requirements 957-959
  ...DMS_ROOM_CHESTS.map((name): RuleEntry => ({
    kind: 'location', name, mode: 'add', rule: hasItem('Hookshot'),
  })),
];

export { FINAL_TOWER_RULES };
