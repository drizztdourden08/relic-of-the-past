/* @layer shared-game @kind data */
/**
 * Non-dungeon rows of Archipelago worlds/alttp/Rules.py global_rules
 * (lines 200-303, 620), baseline options: enemy shuffle off, enemy health
 * default, pot shuffle off, can_take_damage true. Constant sub-terms the
 * fixed options force true are collapsed with a citation.
 */
import {
  allOf, anyOf, canCollect, canReach, hasItem,
} from '../combinators';
import {
  canBombOrBonk, canExtendMagic, canLiftRocks, canShootArrows, canUseBombs, hasBeamSword, hasHearts,
} from '../../state-helpers';
import { canKillMostThings, canRetrieveTablet } from '../../state-helpers-world';
import { BOTTLE_ITEMS } from '../../item-names.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (quantity = 1) => (state: CollectionState): boolean => canUseBombs(state, quantity);
const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

const GLOBAL_MISC_RULES: readonly RuleEntry[] = [
  // 216-221: the mountain S&Q spot opens once its cave dweller is reachable.
  { kind: 'exit', name: 'Old Man S&Q', mode: 'set', rule: canCollect('Old Man') },
  // 223-226
  { kind: 'location', name: 'Sunken Treasure', mode: 'set', rule: hasItem('Open Floodgate') },
  { kind: 'location', name: 'Dark Blacksmith Ruins', mode: 'set', rule: hasItem('Return Smith') },
  { kind: 'location', name: 'Purple Chest', mode: 'set', rule: hasItem('Pick Up Purple Chest') },
  // 227-228
  { kind: 'location', name: 'Ether Tablet', mode: 'set', rule: canRetrieveTablet },
  {
    kind: 'location', name: 'Master Sword Pedestal', mode: 'set',
    rule: allOf(hasItem('Red Pendant'), hasItem('Blue Pendant'), hasItem('Green Pendant')),
  },
  // 230-234
  {
    kind: 'location', name: 'Missing Smith', mode: 'set',
    rule: allOf(hasItem('Get Frog'), canReach('Blacksmiths Hut')),
  },
  { kind: 'location', name: 'Blacksmith', mode: 'set', rule: hasItem('Return Smith') },
  { kind: 'location', name: 'Magic Bat', mode: 'set', rule: hasItem('Magic Powder') },
  { kind: 'location', name: 'Sick Kid', mode: 'set', rule: (state) => state.hasGroup(BOTTLE_ITEMS) },
  { kind: 'location', name: 'Library', mode: 'set', rule: hasItem('Pegasus Boots') },
  // 239-244: enemy shuffle off, enemy health default → the bombs branch stays.
  {
    kind: 'location', name: 'Mimic Cave', mode: 'set',
    rule: allOf(hasItem('Hammer'), anyOf(
      bombs(4), (state) => canShootArrows(state), hasItem('Cane of Somaria'), hasBeamSword,
    )),
  },
  // 246
  { kind: 'location', name: 'Sahasrahla', mode: 'set', rule: hasItem('Green Pendant') },
  // 248-252
  { kind: 'location', name: 'Aginah\'s Cave', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Blind\'s Hideout - Top', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Chicken House', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Kakariko Well - Top', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Graveyard Cave', mode: 'set', rule: bombs() },
  // 253-255
  { kind: 'location', name: 'Sahasrahla\'s Hut - Left', mode: 'set', rule: canBombOrBonk },
  { kind: 'location', name: 'Sahasrahla\'s Hut - Middle', mode: 'set', rule: canBombOrBonk },
  { kind: 'location', name: 'Sahasrahla\'s Hut - Right', mode: 'set', rule: canBombOrBonk },
  // 256-270
  ...['Paradox Cave Lower - Left', 'Paradox Cave Lower - Right', 'Paradox Cave Lower - Far Right',
    'Paradox Cave Lower - Middle', 'Paradox Cave Lower - Far Left'].map((name): RuleEntry => ({
    kind: 'location', name, mode: 'set',
    rule: anyOf(bombs(), hasBeamSword, (state) => canShootArrows(state),
      hasItem('Fire Rod'), hasItem('Cane of Somaria')),
  })),
  // 271-272
  { kind: 'location', name: 'Paradox Cave Upper - Left', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Paradox Cave Upper - Right', mode: 'set', rule: bombs() },
  // 273-277
  ...['Mini Moldorm Cave - Far Left', 'Mini Moldorm Cave - Left', 'Mini Moldorm Cave - Far Right',
    'Mini Moldorm Cave - Right', 'Mini Moldorm Cave - Generous Guy'].map((name): RuleEntry => ({
    kind: 'location', name, mode: 'set', rule: kill(4),
  })),
  // 278-281
  { kind: 'location', name: 'Hype Cave - Bottom', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Hype Cave - Middle Left', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Hype Cave - Middle Right', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Hype Cave - Top', mode: 'set', rule: bombs() },
  // 282-285
  { kind: 'exit', name: 'Light World Death Mountain Shop', mode: 'set', rule: bombs() },
  { kind: 'exit', name: 'Two Brothers House Exit (West)', mode: 'set', rule: canBombOrBonk },
  { kind: 'exit', name: 'Two Brothers House Exit (East)', mode: 'set', rule: canBombOrBonk },
  // 287-293: can_take_damage is true in the baseline (no OHKO timer).
  {
    kind: 'location', name: 'Spike Cave', mode: 'set',
    rule: allOf(
      hasItem('Hammer'),
      canLiftRocks,
      anyOf(
        allOf(hasItem('Cape'), (state) => canExtendMagic(state, 16)),
        allOf(
          hasItem('Cane of Byrna'),
          anyOf(
            (state) => canExtendMagic(state, 12),
            anyOf(hasItem('Pegasus Boots'), (state) => hasHearts(state, 4)),
          ),
        ),
      ),
    ),
  },
  // 295-302
  { kind: 'exit', name: 'Hookshot Cave Bomb Wall (North)', mode: 'set', rule: bombs() },
  { kind: 'exit', name: 'Hookshot Cave Bomb Wall (South)', mode: 'set', rule: bombs() },
  { kind: 'location', name: 'Hookshot Cave - Top Right', mode: 'set', rule: hasItem('Hookshot') },
  { kind: 'location', name: 'Hookshot Cave - Top Left', mode: 'set', rule: hasItem('Hookshot') },
  {
    kind: 'location', name: 'Hookshot Cave - Bottom Right', mode: 'set',
    rule: anyOf(hasItem('Hookshot'), hasItem('Pegasus Boots')),
  },
  { kind: 'location', name: 'Hookshot Cave - Bottom Left', mode: 'set', rule: hasItem('Hookshot') },
  // 620
  { kind: 'location', name: 'Flute Activation Spot', mode: 'set', rule: hasItem('Flute') },
];

export { GLOBAL_MISC_RULES };
