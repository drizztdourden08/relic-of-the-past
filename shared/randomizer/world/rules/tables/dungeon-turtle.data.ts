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
import { ITEM } from '../../item-ids.data';
import { REGION } from '../../region-ids.data';
import {
  allOf, always, anyOf, canReach, either, hasAnyItem, hasItem, hasKeys, placedAt, placedIn,
} from '../combinators';
import {
  arrows, bombs as bombsFor, canBombOrBonk, hasBeamSword, kill,
} from '../helper-rules';
import { actGate } from '../../events';
import { dungeonBossDefeat } from './bosses.data';
import type { LocationKey } from '../../location-key';
import type { RuleEntry } from '../rule-entry.type';

const bombs = bombsFor();

/** 1153: the chests locked behind the front-only doors. */
const FRONT_LOCKED_LOCATIONS: readonly LocationKey[] = [
  'check-220',
  'check-221',
  'check-222',
];

const TURTLE_RULES: readonly RuleEntry[] = [
  // default_rules 732
  {
    kind: 'exit', target: 'Turtle Rock', mode: 'set',
    // The medallion opened it once and the seal stays down, so the act carries the casting.
    rule: allOf(
      hasItem(ITEM.moonPearl), actGate('check-345'),
      canReach(REGION.turtleRockTop),
    ),
  },
  // 490-491
  { kind: 'exit', target: 'Turtle Rock Entrance Gap', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  { kind: 'exit', target: 'Turtle Rock Entrance Gap Reverse', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  // 492-496
  { kind: 'location', target: 'check-233', mode: 'set', rule: kill(5) },
  { kind: 'location', target: 'check-234', mode: 'set', rule: kill(5) },
  { kind: 'location', target: 'check-220', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  {
    kind: 'location', target: 'check-221', mode: 'set',
    rule: allOf(hasItem(ITEM.caneOfSomaria), hasItem(ITEM.fireRod)),
  },
  {
    kind: 'location', target: 'check-222', mode: 'set',
    rule: allOf(hasItem(ITEM.caneOfSomaria), hasItem(ITEM.fireRod)),
  },
  // 497-499 (the big-key door rule is re-set identically at 1167)
  {
    kind: 'location', target: 'check-225', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeyTurtleRock), anyOf(hasItem(ITEM.caneOfSomaria), hasItem(ITEM.hookshot))),
  },
  {
    kind: 'exit', target: 'Turtle Rock (Big Chest) (North)', mode: 'set',
    rule: anyOf(hasItem(ITEM.caneOfSomaria), hasItem(ITEM.hookshot)),
  },
  {
    kind: 'exit', target: 'Turtle Rock Big Key Door', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeyTurtleRock), kill(10), canBombOrBonk),
  },
  // 500-501
  {
    kind: 'location', target: 'check-223', mode: 'set',
    rule: anyOf(
      bombs, arrows(), hasBeamSword,
      hasAnyItem([ITEM.blueBoomerang, ITEM.redBoomerang, ITEM.hookshot, ITEM.caneOfSomaria, ITEM.fireRod, ITEM.iceRod]),
    ),
  },
  // 502-503
  { kind: 'exit', target: 'Turtle Rock (Dark Room) (North)', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  { kind: 'exit', target: 'Turtle Rock (Dark Room) (South)', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  // 504-507
  ...['check-227', 'check-228',
    'check-229', 'check-230'].map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set',
    rule: anyOf(hasItem(ITEM.caneOfByrna), hasItem(ITEM.cape), hasItem(ITEM.mirrorShield)),
  })),
  // 508
  {
    kind: 'exit', target: 'Turtle Rock (Trinexx)', mode: 'set',
    rule: allOf(
      hasKeys(ITEM.smallKeyTurtleRock, 6),
      hasItem(ITEM.bigKeyTurtleRock),
      hasItem(ITEM.caneOfSomaria),
    ),
  },
  // 509 + 512 (fix_trock_doors false)
  { kind: 'exit', target: 'Turtle Rock Second Section Bomb Wall', mode: 'set', rule: kill(10) },
  { kind: 'exit', target: 'Turtle Rock Second Section Bomb Wall', mode: 'add', rule: bombs },
  // 513-515
  { kind: 'exit', target: 'Turtle Rock Second Section from Bomb Wall', mode: 'set', rule: bombs },
  { kind: 'exit', target: 'Turtle Rock Eye Bridge from Bomb Wall', mode: 'set', rule: bombs },
  { kind: 'exit', target: 'Turtle Rock Eye Bridge Bomb Wall', mode: 'set', rule: bombs },
  // set_trock_key_rules 1170-1171
  { kind: 'exit', target: 'Turtle Rock Dark Room Staircase', mode: 'set', rule: hasKeys(ITEM.smallKeyTurtleRock, 5) },
  // 1183-1196 (back unreachable branch)
  {
    kind: 'exit', target: 'Turtle Rock (Chain Chomp Room) (South)', mode: 'set',
    rule: either(
      placedIn(ITEM.bigKeyTurtleRock, [...FRONT_LOCKED_LOCATIONS, 'check-233']),
      hasKeys(ITEM.smallKeyTurtleRock, 3),
      hasKeys(ITEM.smallKeyTurtleRock, 5),
    ),
  },
  {
    kind: 'exit', target: 'Turtle Rock (Pokey Room) (South)', mode: 'set',
    rule: either(
      placedIn(ITEM.bigKeyTurtleRock, FRONT_LOCKED_LOCATIONS),
      hasKeys(ITEM.smallKeyTurtleRock, 4),
      hasKeys(ITEM.smallKeyTurtleRock, 6),
    ),
  },
  { kind: 'exit', target: 'Turtle Rock (Chain Chomp Room) (North)', mode: 'set', rule: hasKeys(ITEM.smallKeyTurtleRock, 3) },
  { kind: 'exit', target: 'Turtle Rock (Pokey Room) (North)', mode: 'set', rule: hasKeys(ITEM.smallKeyTurtleRock, 2) },
  { kind: 'exit', target: 'Turtle Rock Entrance to Pokey Room', mode: 'set', rule: hasKeys(ITEM.smallKeyTurtleRock, 1) },
  // 1198-1208: keys needed depend on what sits in the chest itself.
  {
    kind: 'location', target: 'check-224', mode: 'set',
    rule: either(
      placedAt('check-224', ITEM.smallKeyTurtleRock),
      always,
      either(
        placedAt('check-224', ITEM.bigKeyTurtleRock),
        hasKeys(ITEM.smallKeyTurtleRock, 4),
        hasKeys(ITEM.smallKeyTurtleRock, 6),
      ),
    ),
  },
  // dungeon_boss_rules
  { kind: 'location', target: 'check-231', mode: 'add', rule: dungeonBossDefeat('dungeon-012') },
  { kind: 'location', target: 'check-232', mode: 'add', rule: dungeonBossDefeat('dungeon-012') },
];

export { TURTLE_RULES };
