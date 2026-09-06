/* @layer shared-game @kind data */
/**
 * The mountain shell dungeon, from Archipelago worlds/alttp/Rules.py:
 * the medallion entrance (default_rules 732), global_rules 490-515
 * (fix_trock_doors is false for vanilla entrances + open mode, so the
 * bomb-wall rows 511-515 apply) and set_trock_key_rules 1136-1234. Under
 * vanilla wiring the locked-door probe resolves to: front reachable, middle
 * / big-chest / back unreachable, so the not-can_reach_back branch applies
 * (1183-1208), no forbids fire (1211 needs an unreachable front), and the
 * self-allowance (1232-1234) lives in the item-rules table. Dark-room lamp
 * rows come from the lamp table.
 */
import {
  allOf, anyOf, either, hasItem, hasKeys, placedAt, placedIn,
} from '../combinators';
import { canBombOrBonk, canShootArrows, canUseBombs, hasBeamSword } from '../../state-helpers';
import { canKillMostThings, canUseMedallion, hasTurtleRockMedallion } from '../../state-helpers-world';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (state: CollectionState): boolean => canUseBombs(state);
const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

/** 1153: the chests locked behind the front-only doors. */
const FRONT_LOCKED_LOCATIONS: readonly string[] = [
  'Turtle Rock - Compass Chest',
  'Turtle Rock - Roller Room - Left',
  'Turtle Rock - Roller Room - Right',
];

const TURTLE_RULES: readonly RuleEntry[] = [
  // default_rules 732
  {
    kind: 'exit', name: 'Turtle Rock', mode: 'set',
    rule: allOf(
      hasItem('Moon Pearl'), canUseMedallion, hasTurtleRockMedallion,
      (state) => state.canReachRegion('Turtle Rock (Top)'),
    ),
  },
  // 490-491
  { kind: 'exit', name: 'Turtle Rock Entrance Gap', mode: 'set', rule: hasItem('Cane of Somaria') },
  { kind: 'exit', name: 'Turtle Rock Entrance Gap Reverse', mode: 'set', rule: hasItem('Cane of Somaria') },
  // 492-496
  { kind: 'location', name: 'Turtle Rock - Pokey 1 Key Drop', mode: 'set', rule: kill(5) },
  { kind: 'location', name: 'Turtle Rock - Pokey 2 Key Drop', mode: 'set', rule: kill(5) },
  { kind: 'location', name: 'Turtle Rock - Compass Chest', mode: 'set', rule: hasItem('Cane of Somaria') },
  {
    kind: 'location', name: 'Turtle Rock - Roller Room - Left', mode: 'set',
    rule: allOf(hasItem('Cane of Somaria'), hasItem('Fire Rod')),
  },
  {
    kind: 'location', name: 'Turtle Rock - Roller Room - Right', mode: 'set',
    rule: allOf(hasItem('Cane of Somaria'), hasItem('Fire Rod')),
  },
  // 497-499 (the big-key door rule is re-set identically at 1167)
  {
    kind: 'location', name: 'Turtle Rock - Big Chest', mode: 'set',
    rule: allOf(hasItem('Big Key (Turtle Rock)'), anyOf(hasItem('Cane of Somaria'), hasItem('Hookshot'))),
  },
  {
    kind: 'exit', name: 'Turtle Rock (Big Chest) (North)', mode: 'set',
    rule: anyOf(hasItem('Cane of Somaria'), hasItem('Hookshot')),
  },
  {
    kind: 'exit', name: 'Turtle Rock Big Key Door', mode: 'set',
    rule: allOf(hasItem('Big Key (Turtle Rock)'), kill(10), canBombOrBonk),
  },
  // 500-501
  {
    kind: 'location', name: 'Turtle Rock - Chain Chomps', mode: 'set',
    rule: anyOf(
      bombs, (state) => canShootArrows(state), hasBeamSword,
      (state) => state.hasAny(['Blue Boomerang', 'Red Boomerang', 'Hookshot', 'Cane of Somaria', 'Fire Rod', 'Ice Rod']),
    ),
  },
  // 502-503
  { kind: 'exit', name: 'Turtle Rock (Dark Room) (North)', mode: 'set', rule: hasItem('Cane of Somaria') },
  { kind: 'exit', name: 'Turtle Rock (Dark Room) (South)', mode: 'set', rule: hasItem('Cane of Somaria') },
  // 504-507
  ...['Turtle Rock - Eye Bridge - Bottom Left', 'Turtle Rock - Eye Bridge - Bottom Right',
    'Turtle Rock - Eye Bridge - Top Left', 'Turtle Rock - Eye Bridge - Top Right'].map((name): RuleEntry => ({
    kind: 'location', name, mode: 'set',
    rule: anyOf(hasItem('Cane of Byrna'), hasItem('Cape'), hasItem('Mirror Shield')),
  })),
  // 508
  {
    kind: 'exit', name: 'Turtle Rock (Trinexx)', mode: 'set',
    rule: allOf(
      hasKeys('Small Key (Turtle Rock)', 6),
      hasItem('Big Key (Turtle Rock)'),
      hasItem('Cane of Somaria'),
    ),
  },
  // 509 + 512 (fix_trock_doors false)
  { kind: 'exit', name: 'Turtle Rock Second Section Bomb Wall', mode: 'set', rule: kill(10) },
  { kind: 'exit', name: 'Turtle Rock Second Section Bomb Wall', mode: 'add', rule: bombs },
  // 513-515
  { kind: 'exit', name: 'Turtle Rock Second Section from Bomb Wall', mode: 'set', rule: bombs },
  { kind: 'exit', name: 'Turtle Rock Eye Bridge from Bomb Wall', mode: 'set', rule: bombs },
  { kind: 'exit', name: 'Turtle Rock Eye Bridge Bomb Wall', mode: 'set', rule: bombs },
  // set_trock_key_rules 1170-1171
  { kind: 'exit', name: 'Turtle Rock Dark Room Staircase', mode: 'set', rule: hasKeys('Small Key (Turtle Rock)', 5) },
  // 1183-1196 (back unreachable branch)
  {
    kind: 'exit', name: 'Turtle Rock (Chain Chomp Room) (South)', mode: 'set',
    rule: either(
      placedIn('Big Key (Turtle Rock)', [...FRONT_LOCKED_LOCATIONS, 'Turtle Rock - Pokey 1 Key Drop']),
      hasKeys('Small Key (Turtle Rock)', 3),
      hasKeys('Small Key (Turtle Rock)', 5),
    ),
  },
  {
    kind: 'exit', name: 'Turtle Rock (Pokey Room) (South)', mode: 'set',
    rule: either(
      placedIn('Big Key (Turtle Rock)', FRONT_LOCKED_LOCATIONS),
      hasKeys('Small Key (Turtle Rock)', 4),
      hasKeys('Small Key (Turtle Rock)', 6),
    ),
  },
  { kind: 'exit', name: 'Turtle Rock (Chain Chomp Room) (North)', mode: 'set', rule: hasKeys('Small Key (Turtle Rock)', 3) },
  { kind: 'exit', name: 'Turtle Rock (Pokey Room) (North)', mode: 'set', rule: hasKeys('Small Key (Turtle Rock)', 2) },
  { kind: 'exit', name: 'Turtle Rock Entrance to Pokey Room', mode: 'set', rule: hasKeys('Small Key (Turtle Rock)', 1) },
  // 1198-1208: keys needed depend on what sits in the chest itself.
  {
    kind: 'location', name: 'Turtle Rock - Big Key Chest', mode: 'set',
    rule: either(
      placedAt('Turtle Rock - Big Key Chest', 'Small Key (Turtle Rock)'),
      () => true,
      either(
        placedAt('Turtle Rock - Big Key Chest', 'Big Key (Turtle Rock)'),
        hasKeys('Small Key (Turtle Rock)', 4),
        hasKeys('Small Key (Turtle Rock)', 6),
      ),
    ),
  },
  // dungeon_boss_rules
  { kind: 'location', name: 'Turtle Rock - Boss', mode: 'add', rule: dungeonBossDefeat('Turtle Rock') },
  { kind: 'location', name: 'Turtle Rock - Prize', mode: 'add', rule: dungeonBossDefeat('Turtle Rock') },
];

export { TURTLE_RULES };
