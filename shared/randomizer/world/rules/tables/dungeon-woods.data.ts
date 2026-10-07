/* @layer shared-game @kind data */
/**
 * The forest dungeon, from Archipelago worlds/alttp/Rules.py: the entrance
 * rows (default_rules 694-695, 715), global_rules 425-435 (all first-section
 * doors cost the full key count, 425-429), the glitch-jump lockout
 * (forbid_bomb_jump_requirements 961) and the boss defeat rule. The
 * big-chest self-allowance lives in the item-rules table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, never,
} from '../combinators';
import { bombs, hasSword } from '../helper-rules';
import { actGate } from '../../events';
import { dungeonBossDefeat } from './bosses.data';
import { compileRule } from '../rule-eval';
import { option } from '../rule-node-build';
import type { RuleEntry } from '../rule-entry.type';

/** The switch that lets the cloth be pulled down, blade or not (item-power/). */
const curtainsPullable = compileRule(option('itemPower.pullableCurtains', true));

const WOODS_RULES: readonly RuleEntry[] = [
  // default_rules 694-695: drops under bushes stay bunny-proof.
  { kind: 'exit', target: 'Skull Woods First Section Hole (North)', mode: 'set', rule: hasItem(ITEM.moonPearl) },
  { kind: 'exit', target: 'Skull Woods Second Section Hole', mode: 'set', rule: hasItem(ITEM.moonPearl) },
  // default_rules 715
  {
    kind: 'exit', target: 'Skull Woods Final Section', mode: 'set',
    // The thorns burned away once and stay burned, so the act carries the fire.
    rule: allOf(actGate('check-343'), hasItem(ITEM.moonPearl)),
  },
  // 426-429
  ...[
    'Skull Woods First Section South Door',
    'Skull Woods First Section (Right) North Door',
    'Skull Woods First Section West Door',
    'Skull Woods First Section (Left) Door to Exit',
  ].map((target): RuleEntry => ({
    kind: 'exit', target, mode: 'set', rule: hasKeys(ITEM.smallKeySkullWoods, 5),
  })),
  // 430
  {
    kind: 'location', target: 'check-186', mode: 'set',
    rule: allOf(hasItem(ITEM.bigKeySkullWoods), bombs()),
  },
  // 433: the hanging cloth door needs a blade to cut, unless the switch that lets it be
  // pulled down instead is on, which is the reference's own swordless branch.
  {
    kind: 'exit', target: 'Skull Woods Torch Room', mode: 'set',
    rule: allOf(hasKeys(ITEM.smallKeySkullWoods, 4), hasItem(ITEM.fireRod),
      anyOf(hasSword, curtainsPullable)),
  },
  // forbid_bomb_jump_requirements 961
  { kind: 'exit', target: 'Skull Woods First Section Bomb Jump', mode: 'set', rule: never },
  // dungeon_boss_rules, then 434-435 add the full key count.
  { kind: 'location', target: 'check-191', mode: 'add', rule: dungeonBossDefeat('dungeon-008') },
  { kind: 'location', target: 'check-192', mode: 'add', rule: dungeonBossDefeat('dungeon-008') },
  { kind: 'location', target: 'check-191', mode: 'add', rule: hasKeys(ITEM.smallKeySkullWoods, 5) },
  { kind: 'location', target: 'check-192', mode: 'add', rule: hasKeys(ITEM.smallKeySkullWoods, 5) },
];

export { WOODS_RULES };
