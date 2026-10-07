/* @layer shared-game @kind data */
/**
 * The castle tower, from Archipelago worlds/alttp/Rules.py: the barrier
 * entrance (default_rules 662), the tower climb (global_rules 314-326) and
 * the first tower fight's defeat rule (dungeon_boss_rules 176-197). Lamp
 * requirements come from the lamp table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys,
} from '../combinators';
import { hasSword, kill } from '../helper-rules';
import { STORY_EVENT, actGate, storyEvent } from '../../events';
import { compileRule } from '../rule-eval';
import { all, has, option } from '../rule-node-build';
import { dungeonBossDefeat } from './bosses.data';
import { barrierRule } from '../story-gate-rules';
import type { RuleEntry } from '../rule-entry.type';

/** The seal takes a hammer while that switch is on, see item-power/ and the core hook behind it. */
const sealTakesHammer = compileRule(all(option('itemPower.hammerTowerSeal', true), has(ITEM.hammer)));

/** Rules.py swordless_rules: the branches that only open when no blade is in the seed at all. */
const bladelessSeed = compileRule(option('progressive.swordless', true));

const CASTLE_TOWER_RULES: readonly RuleEntry[] = [
  // default_rules 662: the barrier falls to the cape, a beam sword, or the win, and, on the
  // switch the swordless branch arms, to the hammer. Cutting it is an act the game writes
  // down and the cape is not: one slips past a barrier that is still standing.
  {
    kind: 'exit', target: 'Agahnims Tower', mode: 'set',
    rule: anyOf(
      hasItem(ITEM.cape), actGate('check-314'), sealTakesHammer, barrierRule, storyEvent(STORY_EVENT.agahnim1Beaten),
    ),
  },
  // 314-315, plus Rules.py swordless_rules: with no blade anywhere in the seed the entrance
  // asks only what the fight itself asks, which the hammer and the net already satisfy.
  {
    kind: 'exit', target: 'Agahnim 1', mode: 'set',
    rule: allOf(
      anyOf(hasSword, allOf(bladelessSeed, anyOf(hasItem(ITEM.hammer), hasItem(ITEM.bugCatchingNet)))),
      hasKeys(ITEM.smallKeyAgahnimsTower, 4),
    ),
  },
  // dungeon_boss_rules: the fight carries the boss defeat rule.
  { kind: 'event', target: STORY_EVENT.agahnim1Beaten, mode: 'add', rule: dungeonBossDefeat('dungeon-002') },
  // 317-326
  { kind: 'location', target: 'check-112', mode: 'set', rule: kill(4) },
  {
    kind: 'location', target: 'check-113', mode: 'set',
    rule: allOf(kill(4), hasKeys(ITEM.smallKeyAgahnimsTower, 1)),
  },
  {
    kind: 'location', target: 'check-114', mode: 'set',
    rule: allOf(kill(4), hasKeys(ITEM.smallKeyAgahnimsTower, 2)),
  },
  {
    kind: 'location', target: 'check-115', mode: 'set',
    rule: allOf(kill(4), hasKeys(ITEM.smallKeyAgahnimsTower, 3)),
  },
];

export { CASTLE_TOWER_RULES };
