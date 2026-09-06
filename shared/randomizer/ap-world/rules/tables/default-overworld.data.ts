/* @layer shared-game @kind data */
/**
 * Overworld rows of tests/fixtures/ap-source/Rules.py default_rules
 * (lines 623-734, non-inverted) merged with the no_glitches_rules overworld
 * rows (lines 910-919) that set_rule the same names afterwards — only the
 * surviving final rule is kept, both line numbers cited. Dungeon-entrance
 * rows live in the per-dungeon tables; the goal/pyramid rows in the
 * completion table.
 */
import {
  allOf, anyOf, hasItem, never,
} from '../combinators';
import { canLiftHeavyRocks, canLiftRocks, canUseBombs } from '../../state-helpers';
import { canRetrieveTablet } from '../../state-helpers-world';
import type { RuleEntry } from '../rule-entry.type';

const DEFAULT_OVERWORLD_RULES: readonly RuleEntry[] = [
  // 627-630
  { kind: 'exit', name: 'Light World Bomb Hut', mode: 'set', rule: (state) => canUseBombs(state) },
  { kind: 'exit', name: 'Light Hype Fairy', mode: 'set', rule: (state) => canUseBombs(state) },
  { kind: 'exit', name: 'Mini Moldorm Cave', mode: 'set', rule: (state) => canUseBombs(state) },
  { kind: 'exit', name: 'Ice Rod Cave', mode: 'set', rule: (state) => canUseBombs(state) },
  // 632-635
  { kind: 'exit', name: 'Kings Grave', mode: 'set', rule: hasItem('Pegasus Boots') },
  { kind: 'exit', name: 'Kings Grave Outer Rocks', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'exit', name: 'Kings Grave Inner Rocks', mode: 'set', rule: canLiftHeavyRocks },
  {
    kind: 'exit', name: 'Kings Grave Mirror Spot', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Magic Mirror')),
  },
  // 637-639
  { kind: 'exit', name: 'Bonk Fairy (Light)', mode: 'set', rule: hasItem('Pegasus Boots') },
  {
    kind: 'exit', name: 'Lumberjack Tree Tree', mode: 'set',
    rule: allOf(hasItem('Pegasus Boots'), hasItem('Beat Agahnim 1')),
  },
  { kind: 'exit', name: 'Bonk Rock Cave', mode: 'set', rule: hasItem('Pegasus Boots') },
  // 641-644
  { kind: 'exit', name: 'Sanctuary Grave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', name: '20 Rupee Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', name: '50 Rupee Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', name: 'Death Mountain Entrance Rock', mode: 'set', rule: canLiftRocks },
  // 645-646
  { kind: 'exit', name: 'Bumper Cave Entrance Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Flute Spot 1', mode: 'set', rule: hasItem('Activated Flute') },
  // 647-651
  { kind: 'exit', name: 'Lake Hylia Central Island Teleporter', mode: 'set', rule: canLiftHeavyRocks },
  {
    kind: 'exit', name: 'Dark Desert Teleporter', mode: 'set',
    rule: allOf(hasItem('Activated Flute'), canLiftHeavyRocks),
  },
  {
    kind: 'exit', name: 'East Hyrule Teleporter', mode: 'set',
    rule: allOf(hasItem('Hammer'), canLiftRocks, hasItem('Moon Pearl')),
  },
  {
    kind: 'exit', name: 'South Hyrule Teleporter', mode: 'set',
    rule: allOf(hasItem('Hammer'), canLiftRocks, hasItem('Moon Pearl')),
  },
  {
    kind: 'exit', name: 'Kakariko Teleporter', mode: 'set',
    rule: allOf(anyOf(allOf(hasItem('Hammer'), canLiftRocks), canLiftHeavyRocks), hasItem('Moon Pearl')),
  },
  // 652-653
  { kind: 'location', name: 'Flute Spot', mode: 'set', rule: hasItem('Shovel') },
  { kind: 'exit', name: 'Bat Cave Drop Ledge', mode: 'set', rule: hasItem('Hammer') },
  // 655-658
  { kind: 'location', name: 'Zora\'s Ledge', mode: 'set', rule: hasItem('Flippers') },
  { kind: 'exit', name: 'Waterfall of Wishing', mode: 'set', rule: hasItem('Flippers') },
  { kind: 'location', name: 'Frog', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'location', name: 'Potion Shop', mode: 'set', rule: hasItem('Mushroom') },
  // 661, 663-664
  { kind: 'exit', name: 'Checkerboard Cave', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', name: 'Top of Pyramid', mode: 'set', rule: hasItem('Beat Agahnim 1') },
  { kind: 'exit', name: 'Old Man Cave Exit (West)', mode: 'set', rule: never },
  // 665-668
  { kind: 'exit', name: 'Broken Bridge (West)', mode: 'set', rule: hasItem('Hookshot') },
  { kind: 'exit', name: 'Broken Bridge (East)', mode: 'set', rule: hasItem('Hookshot') },
  { kind: 'exit', name: 'East Death Mountain Teleporter', mode: 'set', rule: canLiftHeavyRocks },
  { kind: 'exit', name: 'Fairy Ascension Rocks', mode: 'set', rule: canLiftHeavyRocks },
  // 669 (a nonexistent-item rule) overridden by 919 under no_glitches.
  { kind: 'exit', name: 'Paradox Cave Push Block Reverse', mode: 'set', rule: never },
  // 670-672
  { kind: 'exit', name: 'Death Mountain (Top)', mode: 'set', rule: hasItem('Hammer') },
  {
    kind: 'exit', name: 'Turtle Rock Teleporter', mode: 'set',
    rule: allOf(canLiftHeavyRocks, hasItem('Hammer')),
  },
  { kind: 'exit', name: 'East Death Mountain (Top)', mode: 'set', rule: hasItem('Hammer') },
  // 674-680
  { kind: 'exit', name: 'Catfish Exit Rock', mode: 'set', rule: canLiftRocks },
  { kind: 'exit', name: 'Catfish Entrance Rock', mode: 'set', rule: canLiftRocks },
  {
    kind: 'exit', name: 'Northeast Dark World Broken Bridge Pass', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), anyOf(canLiftRocks, hasItem('Hammer'), hasItem('Flippers'))),
  },
  {
    kind: 'exit', name: 'East Dark World Broken Bridge Pass', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), anyOf(canLiftRocks, hasItem('Hammer'))),
  },
  {
    kind: 'exit', name: 'South Dark World Bridge', mode: 'set',
    rule: allOf(hasItem('Hammer'), hasItem('Moon Pearl')),
  },
  {
    kind: 'exit', name: 'Bonk Fairy (Dark)', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Pegasus Boots')),
  },
  {
    kind: 'exit', name: 'West Dark World Gap', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Hookshot')),
  },
  // 682-683
  { kind: 'exit', name: 'Hyrule Castle Ledge Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Hyrule Castle Main Gate', mode: 'set', rule: hasItem('Magic Mirror') },
  // 684 overridden by 914 (no_glitches drops the mirror escape).
  {
    kind: 'exit', name: 'Dark Lake Hylia Drop (East)', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Flippers')),
  },
  // 686-692
  {
    kind: 'exit', name: 'Dark Lake Hylia Drop (South)', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Flippers')),
  },
  {
    kind: 'exit', name: 'Dark Lake Hylia Ledge Fairy', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), (state) => canUseBombs(state)),
  },
  {
    kind: 'exit', name: 'Dark Lake Hylia Ledge Spike Cave', mode: 'set',
    rule: allOf(canLiftRocks, hasItem('Moon Pearl')),
  },
  // 689 overridden by 915.
  {
    kind: 'exit', name: 'Dark Lake Hylia Teleporter', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Flippers')),
  },
  {
    kind: 'exit', name: 'Village of Outcasts Heavy Rock', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), canLiftHeavyRocks),
  },
  {
    kind: 'exit', name: 'Hype Cave', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), (state) => canUseBombs(state)),
  },
  {
    kind: 'exit', name: 'Brewery', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), (state) => canUseBombs(state)),
  },
  // 696-698
  { kind: 'exit', name: 'Maze Race Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Cave 45 Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Bombos Tablet Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  // 699-706
  {
    kind: 'exit', name: 'East Dark World Bridge', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Hammer')),
  },
  {
    kind: 'exit', name: 'Lake Hylia Island Mirror Spot', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Magic Mirror'), hasItem('Flippers')),
  },
  { kind: 'exit', name: 'Lake Hylia Central Island Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  {
    kind: 'exit', name: 'East Dark World River Pier', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Flippers')),
  },
  {
    kind: 'exit', name: 'Graveyard Ledge Mirror Spot', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Magic Mirror')),
  },
  {
    kind: 'exit', name: 'Bumper Cave Entrance Rock', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), canLiftRocks),
  },
  { kind: 'exit', name: 'Bumper Cave Ledge Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Bat Cave Drop Ledge Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  // 707-713
  {
    kind: 'exit', name: 'Dark World Hammer Peg Cave', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Hammer')),
  },
  {
    kind: 'exit', name: 'Village of Outcasts Eastern Rocks', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), canLiftHeavyRocks),
  },
  {
    kind: 'exit', name: 'Peg Area Rocks', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), canLiftHeavyRocks),
  },
  {
    kind: 'exit', name: 'Village of Outcasts Pegs', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Hammer')),
  },
  {
    kind: 'exit', name: 'Grassy Lawn Pegs', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Hammer')),
  },
  { kind: 'exit', name: 'Bumper Cave Exit (Top)', mode: 'set', rule: hasItem('Cape') },
  {
    kind: 'exit', name: 'Bumper Cave Exit (Bottom)', mode: 'set',
    rule: anyOf(hasItem('Cape'), hasItem('Hookshot')),
  },
  // 717-722
  { kind: 'exit', name: 'Desert Ledge (Northeast) Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Desert Ledge Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Desert Palace Stairs Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Desert Palace Entrance (North) Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Spectacle Rock Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  // 723
  {
    kind: 'exit', name: 'Hookshot Cave', mode: 'set',
    rule: allOf(canLiftRocks, hasItem('Moon Pearl')),
  },
  // 725-731
  { kind: 'exit', name: 'East Death Mountain (Top) Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Mimic Cave Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Spiral Cave Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  {
    kind: 'exit', name: 'Fairy Ascension Mirror Spot', mode: 'set',
    rule: allOf(hasItem('Magic Mirror'), hasItem('Moon Pearl')),
  },
  { kind: 'exit', name: 'Isolated Ledge Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  { kind: 'exit', name: 'Superbunny Cave Exit (Bottom)', mode: 'set', rule: never },
  { kind: 'exit', name: 'Floating Island Mirror Spot', mode: 'set', rule: hasItem('Magic Mirror') },
  // 685
  { kind: 'location', name: 'Bombos Tablet', mode: 'set', rule: canRetrieveTablet },
  // forbid_bomb_jump_requirements 960
  { kind: 'exit', name: 'Paradox Cave Bomb Jump', mode: 'set', rule: never },
  // no_glitches_rules 911-916 (rows not overriding a default row above)
  { kind: 'exit', name: 'Zoras River', mode: 'set', rule: anyOf(hasItem('Flippers'), canLiftRocks) },
  { kind: 'exit', name: 'Lake Hylia Central Island Pier', mode: 'set', rule: hasItem('Flippers') },
  { kind: 'exit', name: 'Hobo Bridge', mode: 'set', rule: hasItem('Flippers') },
  {
    kind: 'exit', name: 'Dark Lake Hylia Ledge Drop', mode: 'set',
    rule: allOf(hasItem('Moon Pearl'), hasItem('Flippers')),
  },
];

export { DEFAULT_OVERWORLD_RULES };
