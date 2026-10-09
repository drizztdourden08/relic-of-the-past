/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import { REGION } from '../../../region-ids.data';
import {
  allOf, always, anyOf, canReach, either, hasAnyItem, hasItem, hasKeys, placedAt, placedIn,
} from '../../combinators';
import {
  arrows, bombs, canBombOrBonk, hasBeamSword, kill,
} from '../../helper-rules';
import { actGate } from '../../../events';
import { dungeonBossDefeat } from '../bosses.data';
import type { LocationKey } from '../../../location-key.type';
import type { RuleEntry } from '../../rule-entry.type';

const BOMBS = bombs();

const FRONT_LOCKED_LOCATIONS: readonly LocationKey[] = [
  'check-220',
  'check-221',
  'check-222',
];

const LASER_BRIDGE_LOCATIONS: readonly LocationKey[] = ['check-227', 'check-228', 'check-229', 'check-230'];

const TURTLE_RULES: readonly RuleEntry[] = [
  {
    kind: 'exit', target: 'Turtle Rock', mode: 'set',
    rule: allOf(
      hasItem(ITEM.moonPearl), actGate('check-345'),
      canReach(REGION.turtleRockTop),
    ),
  },
  { kind: 'exit', target: 'Turtle Rock Entrance Gap', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  { kind: 'exit', target: 'Turtle Rock Entrance Gap Reverse', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
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
  {
    kind: 'location', target: 'check-223', mode: 'set',
    rule: anyOf(
      BOMBS, arrows(), hasBeamSword,
      hasAnyItem([ITEM.blueBoomerang, ITEM.redBoomerang, ITEM.hookshot, ITEM.caneOfSomaria, ITEM.fireRod, ITEM.iceRod]),
    ),
  },
  { kind: 'exit', target: 'Turtle Rock (Dark Room) (North)', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  { kind: 'exit', target: 'Turtle Rock (Dark Room) (South)', mode: 'set', rule: hasItem(ITEM.caneOfSomaria) },
  ...LASER_BRIDGE_LOCATIONS.map((target): RuleEntry => ({
    kind: 'location', target, mode: 'set',
    rule: anyOf(hasItem(ITEM.caneOfByrna), hasItem(ITEM.cape), hasItem(ITEM.mirrorShield)),
  })),
  {
    kind: 'exit', target: 'Turtle Rock (Trinexx)', mode: 'set',
    rule: allOf(
      hasKeys(ITEM.smallKeyTurtleRock, 6),
      hasItem(ITEM.bigKeyTurtleRock),
      hasItem(ITEM.caneOfSomaria),
    ),
  },
  { kind: 'exit', target: 'Turtle Rock Second Section Bomb Wall', mode: 'set', rule: kill(10) },
  { kind: 'exit', target: 'Turtle Rock Second Section Bomb Wall', mode: 'add', rule: BOMBS },
  { kind: 'exit', target: 'Turtle Rock Second Section from Bomb Wall', mode: 'set', rule: BOMBS },
  { kind: 'exit', target: 'Turtle Rock Eye Bridge from Bomb Wall', mode: 'set', rule: BOMBS },
  { kind: 'exit', target: 'Turtle Rock Eye Bridge Bomb Wall', mode: 'set', rule: BOMBS },
  { kind: 'exit', target: 'Turtle Rock Dark Room Staircase', mode: 'set', rule: hasKeys(ITEM.smallKeyTurtleRock, 5) },
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
  { kind: 'location', target: 'check-231', mode: 'add', rule: dungeonBossDefeat('dungeon-012') },
  { kind: 'location', target: 'check-232', mode: 'add', rule: dungeonBossDefeat('dungeon-012') },
];

export { TURTLE_RULES };
