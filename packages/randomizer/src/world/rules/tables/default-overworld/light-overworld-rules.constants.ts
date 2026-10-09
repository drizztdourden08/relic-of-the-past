/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids';
import {
  allOf, anyOf, hasItem, never,
} from '../../combinators';
import {
  bombs, canLiftHeavyRocks, canLiftRocks,
} from '../../helper-rules';
import { STORY_EVENT, actGate, storyEvent } from '../../../events';
import type { RuleEntry } from '../../rule-entry.type';

const CAN_CALL_THE_BIRD = anyOf(storyEvent(STORY_EVENT.weathervaneOpened), hasItem(ITEM.activatedFlute));

const LIGHT_OVERWORLD_RULES: readonly RuleEntry[] = [
  { kind: 'exit', target: 'Light World Bomb Hut', mode: 'set', rule: bombs() },
  { kind: 'exit', target: 'Light Hype Fairy', mode: 'set', rule: bombs() },
  { kind: 'exit', target: 'Mini Moldorm Cave', mode: 'set', rule: bombs() },
  { kind: 'exit', target: 'Ice Rod Cave', mode: 'set', rule: bombs() },
  { kind: 'exit', target: 'Kings Grave', mode: 'set', rule: actGate('check-325') },
  { kind: 'exit', target: 'Kings Grave Outer Rocks', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'exit', target: 'Kings Grave Inner Rocks', mode: 'set', rule: canLiftHeavyRocks },
  {
    kind: 'exit', target: 'Kings Grave Mirror Spot', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.magicMirror)),
  },
  { kind: 'exit', target: 'Bonk Fairy (Light)', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  {
    kind: 'exit', target: 'Lumberjack Tree Tree', mode: 'set',
    rule: allOf(hasItem(ITEM.pegasusBoots), storyEvent(STORY_EVENT.agahnim1Beaten)),
  },
  { kind: 'exit', target: 'Bonk Rock Cave', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  { kind: 'exit', target: 'Sanctuary Grave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: '20 Rupee Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: '50 Rupee Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Death Mountain Entrance Rock', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Bumper Cave Entrance Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Flute Spot 1', mode: 'set', rule: CAN_CALL_THE_BIRD },
  { kind: 'exit', target: 'Lake Hylia Central Island Teleporter', mode: 'set', rule: canLiftHeavyRocks },
  {
    kind: 'exit', target: 'Dark Desert Teleporter', mode: 'set',
    rule: allOf(CAN_CALL_THE_BIRD, canLiftHeavyRocks),
  },
  {
    kind: 'exit', target: 'East Hyrule Teleporter', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), canLiftRocks, hasItem(ITEM.moonPearl)),
  },
  {
    kind: 'exit', target: 'South Hyrule Teleporter', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), canLiftRocks, hasItem(ITEM.moonPearl)),
  },
  {
    kind: 'exit', target: 'Kakariko Teleporter', mode: 'set',
    rule: allOf(anyOf(allOf(hasItem(ITEM.hammer), canLiftRocks), canLiftHeavyRocks), hasItem(ITEM.moonPearl)),
  },
  { kind: 'location', target: 'check-008', mode: 'set', rule: hasItem(ITEM.shovel) },
  { kind: 'exit', target: 'Bat Cave Drop Ledge', mode: 'set', rule: hasItem(ITEM.hammer) },
  { kind: 'location', target: 'check-020', mode: 'set', rule: hasItem(ITEM.flippers) },
  { kind: 'exit', target: 'Waterfall of Wishing', mode: 'set', rule: hasItem(ITEM.flippers) },
  { kind: 'event', target: STORY_EVENT.frogFound, mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'location', target: 'check-056', mode: 'set', rule: hasItem(ITEM.mushroom) },
  { kind: 'exit', target: 'Checkerboard Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Top of Pyramid', mode: 'set', rule: storyEvent(STORY_EVENT.agahnim1Beaten) },
  { kind: 'exit', target: 'Old Man Cave Exit (West)', mode: 'set', rule: never },
  { kind: 'exit', target: 'Broken Bridge (West)', mode: 'set', rule: hasItem(ITEM.hookshot) },
  { kind: 'exit', target: 'Broken Bridge (East)', mode: 'set', rule: hasItem(ITEM.hookshot) },
  { kind: 'exit', target: 'East Death Mountain Teleporter', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'exit', target: 'Fairy Ascension Rocks', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'exit', target: 'Paradox Cave Push Block Reverse', mode: 'set', rule: never },
  { kind: 'exit', target: 'Death Mountain (Top)', mode: 'set', rule: hasItem(ITEM.hammer) },
  { kind: 'exit', target: 'Turtle Rock Teleporter', mode: 'set', rule: actGate('check-327') },
  { kind: 'exit', target: 'East Death Mountain (Top)', mode: 'set', rule: hasItem(ITEM.hammer) },
];

export { LIGHT_OVERWORLD_RULES };
