/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids';
import {
  allOf, anyOf, hasItem, never,
} from '../../combinators';
import {
  bombs, canLiftHeavyRocks, canLiftRocks, canRetrieveTablet,
} from '../../helper-rules';
import { actGate } from '../../../events';
import type { RuleEntry } from '../../rule-entry.type';

const DARK_OVERWORLD_RULES: readonly RuleEntry[] = [
  { kind: 'exit', target: 'Catfish Exit Rock', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Catfish Entrance Rock', mode: 'set', rule: canLiftRocks },
  {
    kind: 'exit', target: 'Northeast Dark World Broken Bridge Pass', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), anyOf(canLiftRocks, hasItem(ITEM.hammer), hasItem(ITEM.flippers))),
  },
  {
    kind: 'exit', target: 'East Dark World Broken Bridge Pass', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), anyOf(canLiftRocks, hasItem(ITEM.hammer))),
  },
  {
    kind: 'exit', target: 'South Dark World Bridge', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), hasItem(ITEM.moonPearl)),
  },
  {
    kind: 'exit', target: 'Bonk Fairy (Dark)', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.pegasusBoots)),
  },
  {
    kind: 'exit', target: 'West Dark World Gap', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.hookshot)),
  },
  { kind: 'exit', target: 'Hyrule Castle Ledge Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Hyrule Castle Main Gate', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  {
    kind: 'exit', target: 'Dark Lake Hylia Drop (East)', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
  {
    kind: 'exit', target: 'Dark Lake Hylia Drop (South)', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
  {
    kind: 'exit', target: 'Dark Lake Hylia Ledge Fairy', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), bombs()),
  },
  {
    kind: 'exit', target: 'Dark Lake Hylia Ledge Spike Cave', mode: 'set',
    rule: allOf(canLiftRocks, hasItem(ITEM.moonPearl)),
  },
  {
    kind: 'exit', target: 'Dark Lake Hylia Teleporter', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
  {
    kind: 'exit', target: 'Village of Outcasts Heavy Rock', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), canLiftHeavyRocks),
  },
  {
    kind: 'exit', target: 'Hype Cave', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), bombs()),
  },
  {
    kind: 'exit', target: 'Brewery', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), bombs()),
  },
  { kind: 'exit', target: 'Maze Race Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Cave 45 Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Bombos Tablet Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  {
    kind: 'exit', target: 'East Dark World Bridge', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.hammer)),
  },
  {
    kind: 'exit', target: 'Lake Hylia Island Mirror Spot', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.magicMirror), hasItem(ITEM.flippers)),
  },
  { kind: 'exit', target: 'Lake Hylia Central Island Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  {
    kind: 'exit', target: 'East Dark World River Pier', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
  {
    kind: 'exit', target: 'Graveyard Ledge Mirror Spot', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.magicMirror)),
  },
  {
    kind: 'exit', target: 'Bumper Cave Entrance Rock', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), canLiftRocks),
  },
  { kind: 'exit', target: 'Bumper Cave Ledge Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Bat Cave Drop Ledge Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  {
    kind: 'exit', target: 'Dark World Hammer Peg Cave', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), actGate('check-334')),
  },
  {
    kind: 'exit', target: 'Village of Outcasts Eastern Rocks', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), canLiftHeavyRocks),
  },
  {
    kind: 'exit', target: 'Peg Area Rocks', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), canLiftHeavyRocks),
  },
  {
    kind: 'exit', target: 'Village of Outcasts Pegs', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.hammer)),
  },
  {
    kind: 'exit', target: 'Grassy Lawn Pegs', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.hammer)),
  },
  { kind: 'exit', target: 'Bumper Cave Exit (Top)', mode: 'set', rule: hasItem(ITEM.cape) },
  {
    kind: 'exit', target: 'Bumper Cave Exit (Bottom)', mode: 'set',
    rule: anyOf(hasItem(ITEM.cape), hasItem(ITEM.hookshot)),
  },
  { kind: 'exit', target: 'Desert Ledge (Northeast) Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Desert Ledge Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Desert Palace Stairs Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Desert Palace Entrance (North) Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Spectacle Rock Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  {
    kind: 'exit', target: 'Hookshot Cave', mode: 'set',
    rule: allOf(canLiftRocks, hasItem(ITEM.moonPearl)),
  },
  { kind: 'exit', target: 'East Death Mountain (Top) Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Mimic Cave Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Spiral Cave Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  {
    kind: 'exit', target: 'Fairy Ascension Mirror Spot', mode: 'set',
    rule: allOf(hasItem(ITEM.magicMirror), hasItem(ITEM.moonPearl)),
  },
  { kind: 'exit', target: 'Isolated Ledge Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Superbunny Cave Exit (Bottom)', mode: 'set', rule: never },
  { kind: 'exit', target: 'Floating Island Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'location', target: 'check-080', mode: 'set', rule: canRetrieveTablet },
  { kind: 'exit', target: 'Paradox Cave Bomb Jump', mode: 'set', rule: never },
  { kind: 'exit', target: 'Zoras River', mode: 'set', rule: anyOf(hasItem(ITEM.flippers), canLiftRocks) },
  { kind: 'exit', target: 'Lake Hylia Central Island Pier', mode: 'set', rule: hasItem(ITEM.flippers) },
  { kind: 'exit', target: 'Hobo Bridge', mode: 'set', rule: hasItem(ITEM.flippers) },
  {
    kind: 'exit', target: 'Dark Lake Hylia Ledge Drop', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
];

export { DARK_OVERWORLD_RULES };
