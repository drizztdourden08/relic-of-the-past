/* @layer shared-game @kind data */
/**
 * Overworld rows of Archipelago worlds/alttp/Rules.py default_rules
 * (lines 623-734, non-inverted) merged with the no_glitches_rules overworld
 * rows (lines 910-919) that set_rule the same names afterwards, so only the
 * surviving final rule is kept, both line numbers cited. Dungeon-entrance
 * rows live in the per-dungeon tables; the goal/pyramid rows in the
 * completion table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasItem, never,
} from '../combinators';
import { canLiftHeavyRocks, canLiftRocks, canUseBombs } from '../../state-helpers';
import { canRetrieveTablet } from '../../state-helpers-world';
import { actGate } from '../../events';
import type { RuleEntry } from '../rule-entry.type';

const DEFAULT_OVERWORLD_RULES: readonly RuleEntry[] = [
  // 627-630
  { kind: 'exit', target: 'Light World Bomb Hut', mode: 'set', rule: (state) => canUseBombs(state) },
  { kind: 'exit', target: 'Light Hype Fairy', mode: 'set', rule: (state) => canUseBombs(state) },
  { kind: 'exit', target: 'Mini Moldorm Cave', mode: 'set', rule: (state) => canUseBombs(state) },
  { kind: 'exit', target: 'Ice Rod Cave', mode: 'set', rule: (state) => canUseBombs(state) },
  // 632-635
  // The tomb wall was dashed open once and stays open, so the act carries the boots.
  { kind: 'exit', target: 'Kings Grave', mode: 'set', rule: actGate('check-325') },
  { kind: 'exit', target: 'Kings Grave Outer Rocks', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'exit', target: 'Kings Grave Inner Rocks', mode: 'set', rule: canLiftHeavyRocks },
  {
    kind: 'exit', target: 'Kings Grave Mirror Spot', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.magicMirror)),
  },
  // 637-639
  { kind: 'exit', target: 'Bonk Fairy (Light)', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  {
    kind: 'exit', target: 'Lumberjack Tree Tree', mode: 'set',
    rule: allOf(hasItem(ITEM.pegasusBoots), hasItem(ITEM.beatAgahnim1)),
  },
  { kind: 'exit', target: 'Bonk Rock Cave', mode: 'set', rule: hasItem(ITEM.pegasusBoots) },
  // 641-644
  { kind: 'exit', target: 'Sanctuary Grave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: '20 Rupee Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: '50 Rupee Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Death Mountain Entrance Rock', mode: 'set', rule: canLiftRocks },
  // 645-646
  { kind: 'exit', target: 'Bumper Cave Entrance Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Flute Spot 1', mode: 'set', rule: hasItem(ITEM.activatedFlute) },
  // 647-651
  { kind: 'exit', target: 'Lake Hylia Central Island Teleporter', mode: 'set', rule: canLiftHeavyRocks },
  {
    kind: 'exit', target: 'Dark Desert Teleporter', mode: 'set',
    rule: allOf(hasItem(ITEM.activatedFlute), canLiftHeavyRocks),
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
  // 652-653
  { kind: 'location', target: 'check-008', mode: 'set', rule: hasItem(ITEM.shovel) },
  { kind: 'exit', target: 'Bat Cave Drop Ledge', mode: 'set', rule: hasItem(ITEM.hammer) },
  // 655-658
  { kind: 'location', target: 'check-020', mode: 'set', rule: hasItem(ITEM.flippers) },
  { kind: 'exit', target: 'Waterfall of Wishing', mode: 'set', rule: hasItem(ITEM.flippers) },
  { kind: 'location', target: 'check-335', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'location', target: 'check-056', mode: 'set', rule: hasItem(ITEM.mushroom) },
  // 661, 663-664
  { kind: 'exit', target: 'Checkerboard Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', target: 'Top of Pyramid', mode: 'set', rule: hasItem(ITEM.beatAgahnim1) },
  { kind: 'exit', target: 'Old Man Cave Exit (West)', mode: 'set', rule: never },
  // 665-668
  { kind: 'exit', target: 'Broken Bridge (West)', mode: 'set', rule: hasItem(ITEM.hookshot) },
  { kind: 'exit', target: 'Broken Bridge (East)', mode: 'set', rule: hasItem(ITEM.hookshot) },
  { kind: 'exit', target: 'East Death Mountain Teleporter', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'exit', target: 'Fairy Ascension Rocks', mode: 'set', rule: canLiftHeavyRocks },
  // 669 (a nonexistent-item rule) overridden by 919 under no_glitches.
  { kind: 'exit', target: 'Paradox Cave Push Block Reverse', mode: 'set', rule: never },
  // 670-672
  { kind: 'exit', target: 'Death Mountain (Top)', mode: 'set', rule: hasItem(ITEM.hammer) },
  {
    kind: 'exit', target: 'Turtle Rock Teleporter', mode: 'set',
    // Three pegs hammered in behind a heavy rock, which opens the warp tile for good.
    rule: actGate('check-327'),
  },
  { kind: 'exit', target: 'East Death Mountain (Top)', mode: 'set', rule: hasItem(ITEM.hammer) },
  // 674-680
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
  // 682-683
  { kind: 'exit', target: 'Hyrule Castle Ledge Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Hyrule Castle Main Gate', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  // 684 overridden by 914 (no_glitches drops the mirror escape).
  {
    kind: 'exit', target: 'Dark Lake Hylia Drop (East)', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
  // 686-692
  {
    kind: 'exit', target: 'Dark Lake Hylia Drop (South)', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
  {
    kind: 'exit', target: 'Dark Lake Hylia Ledge Fairy', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), (state) => canUseBombs(state)),
  },
  {
    kind: 'exit', target: 'Dark Lake Hylia Ledge Spike Cave', mode: 'set',
    rule: allOf(canLiftRocks, hasItem(ITEM.moonPearl)),
  },
  // 689 overridden by 915.
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
    rule: allOf(hasItem(ITEM.moonPearl), (state) => canUseBombs(state)),
  },
  {
    kind: 'exit', target: 'Brewery', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), (state) => canUseBombs(state)),
  },
  // 696-698
  { kind: 'exit', target: 'Maze Race Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Cave 45 Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Bombos Tablet Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  // 699-706
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
  // 707-713
  {
    kind: 'exit', target: 'Dark World Hammer Peg Cave', mode: 'set',
    // The peg field was flattened once, so the act carries the hammer.
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
  // 717-722
  { kind: 'exit', target: 'Desert Ledge (Northeast) Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Desert Ledge Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Desert Palace Stairs Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Desert Palace Entrance (North) Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Spectacle Rock Mirror Spot', mode: 'set', rule: hasItem(ITEM.magicMirror) },
  // 723
  {
    kind: 'exit', target: 'Hookshot Cave', mode: 'set',
    rule: allOf(canLiftRocks, hasItem(ITEM.moonPearl)),
  },
  // 725-731
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
  // 685
  { kind: 'location', target: 'check-080', mode: 'set', rule: canRetrieveTablet },
  // forbid_bomb_jump_requirements 960
  { kind: 'exit', target: 'Paradox Cave Bomb Jump', mode: 'set', rule: never },
  // no_glitches_rules 911-916 (rows not overriding a default row above)
  { kind: 'exit', target: 'Zoras River', mode: 'set', rule: anyOf(hasItem(ITEM.flippers), canLiftRocks) },
  { kind: 'exit', target: 'Lake Hylia Central Island Pier', mode: 'set', rule: hasItem(ITEM.flippers) },
  { kind: 'exit', target: 'Hobo Bridge', mode: 'set', rule: hasItem(ITEM.flippers) },
  {
    kind: 'exit', target: 'Dark Lake Hylia Ledge Drop', mode: 'set',
    rule: allOf(hasItem(ITEM.moonPearl), hasItem(ITEM.flippers)),
  },
];

export { DEFAULT_OVERWORLD_RULES };
