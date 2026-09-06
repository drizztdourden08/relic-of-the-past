/* @layer shared-game @kind data */
/**
 * The forest dungeon, from Archipelago worlds/alttp/Rules.py: the entrance
 * rows (default_rules 694-695, 715), global_rules 425-435 (all first-section
 * doors cost the full key count, 425-429), the glitch-jump lockout
 * (forbid_bomb_jump_requirements 961) and the boss defeat rule. The
 * big-chest self-allowance lives in the item-rules table.
 */
import {
  allOf, anyOf, hasItem, hasKeys, never,
} from '../combinators';
import { canUseBombs, hasSword } from '../../state-helpers';
import { dungeonBossDefeat } from './bosses.data';
import { itemPowerOf } from '../../item-power/item-power-rule';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const WOODS_RULES: readonly RuleEntry[] = [
  // default_rules 694-695: drops under bushes stay bunny-proof.
  { kind: 'exit', name: 'Skull Woods First Section Hole (North)', mode: 'set', rule: hasItem('Moon Pearl') },
  { kind: 'exit', name: 'Skull Woods Second Section Hole', mode: 'set', rule: hasItem('Moon Pearl') },
  // default_rules 715
  {
    kind: 'exit', name: 'Skull Woods Final Section', mode: 'set',
    rule: allOf(hasItem('Fire Rod'), hasItem('Moon Pearl')),
  },
  // 426-429
  ...[
    'Skull Woods First Section South Door',
    'Skull Woods First Section (Right) North Door',
    'Skull Woods First Section West Door',
    'Skull Woods First Section (Left) Door to Exit',
  ].map((name): RuleEntry => ({
    kind: 'exit', name, mode: 'set', rule: hasKeys('Small Key (Skull Woods)', 5),
  })),
  // 430
  {
    kind: 'location', name: 'Skull Woods - Big Chest', mode: 'set',
    rule: allOf(hasItem('Big Key (Skull Woods)'), (state: CollectionState) => canUseBombs(state)),
  },
  // 433: the hanging cloth door needs a blade to cut, unless the switch that lets it be
  // pulled down instead is on, which is the reference's own swordless branch.
  {
    kind: 'exit', name: 'Skull Woods Torch Room', mode: 'set',
    rule: allOf(hasKeys('Small Key (Skull Woods)', 4), hasItem('Fire Rod'),
      anyOf(hasSword, (state: CollectionState) => itemPowerOf(state.world).pullableCurtains)),
  },
  // forbid_bomb_jump_requirements 961
  { kind: 'exit', name: 'Skull Woods First Section Bomb Jump', mode: 'set', rule: never },
  // dungeon_boss_rules, then 434-435 add the full key count.
  { kind: 'location', name: 'Skull Woods - Boss', mode: 'add', rule: dungeonBossDefeat('Skull Woods') },
  { kind: 'location', name: 'Skull Woods - Prize', mode: 'add', rule: dungeonBossDefeat('Skull Woods') },
  { kind: 'location', name: 'Skull Woods - Boss', mode: 'add', rule: hasKeys('Small Key (Skull Woods)', 5) },
  { kind: 'location', name: 'Skull Woods - Prize', mode: 'add', rule: hasKeys('Small Key (Skull Woods)', 5) },
];

export { WOODS_RULES };
