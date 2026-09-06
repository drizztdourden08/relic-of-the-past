/* @layer shared-game @kind data */
/**
 * The castle tower, from Archipelago worlds/alttp/Rules.py: the barrier
 * entrance (default_rules 662), the tower climb (global_rules 314-326) and
 * the first tower fight's defeat rule (dungeon_boss_rules 176-197). Lamp
 * requirements come from the lamp table.
 */
import {
  allOf, anyOf, hasItem, hasKeys,
} from '../combinators';
import { hasBeamSword, hasSword } from '../../state-helpers';
import { canKillMostThings } from '../../state-helpers-world';
import { ITEM } from '../../item-names.data';
import { itemPowerOf } from '../../item-power/item-power-rule';
import { isSwordless } from '../../progressive/progressive-reach';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const kill = (enemies: number) => (state: CollectionState): boolean => canKillMostThings(state, enemies);

/** The seal takes a hammer while that switch is on — see item-power/ and the core hook behind it. */
const sealTakesHammer = (state: CollectionState): boolean =>
  itemPowerOf(state.world).hammerTowerSeal && state.has(ITEM.hammer);

/** Rules.py swordless_rules: the branches that only open when no blade is in the seed at all. */
const bladelessSeed = (state: CollectionState): boolean => isSwordless(state.world);

const CASTLE_TOWER_RULES: readonly RuleEntry[] = [
  // default_rules 662: the barrier falls to the cape, a beam sword, or the win — and, on the
  // switch the swordless branch arms, to the hammer.
  {
    kind: 'exit', name: 'Agahnims Tower', mode: 'set',
    rule: anyOf(hasItem('Cape'), hasBeamSword, sealTakesHammer, hasItem('Beat Agahnim 1')),
  },
  // 314-315, plus Rules.py swordless_rules: with no blade anywhere in the seed the entrance
  // asks only what the fight itself asks, which the hammer and the net already satisfy.
  {
    kind: 'exit', name: 'Agahnim 1', mode: 'set',
    rule: allOf(
      anyOf(hasSword, allOf(bladelessSeed, anyOf(hasItem('Hammer'), hasItem('Bug Catching Net')))),
      hasKeys('Small Key (Agahnims Tower)', 4),
    ),
  },
  // dungeon_boss_rules: the fight location carries the boss defeat rule.
  { kind: 'location', name: 'Agahnim 1', mode: 'add', rule: dungeonBossDefeat('Agahnims Tower') },
  // 317-326
  { kind: 'location', name: 'Castle Tower - Room 03', mode: 'set', rule: kill(4) },
  {
    kind: 'location', name: 'Castle Tower - Dark Maze', mode: 'set',
    rule: allOf(kill(4), hasKeys('Small Key (Agahnims Tower)', 1)),
  },
  {
    kind: 'location', name: 'Castle Tower - Dark Archer Key Drop', mode: 'set',
    rule: allOf(kill(4), hasKeys('Small Key (Agahnims Tower)', 2)),
  },
  {
    kind: 'location', name: 'Castle Tower - Circle of Pots Key Drop', mode: 'set',
    rule: allOf(kill(4), hasKeys('Small Key (Agahnims Tower)', 3)),
  },
];

export { CASTLE_TOWER_RULES };
