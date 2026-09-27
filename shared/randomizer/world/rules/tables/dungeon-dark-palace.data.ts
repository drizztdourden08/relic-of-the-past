/* @layer shared-game @kind data */
/**
 * The eastern second-world palace, from Archipelago worlds/alttp/Rules.py:
 * the toll entrance (default_rules 681), global_rules 517-541 (enemy
 * shuffle off → the bonk wall needs arrows, 519-520; pot shuffle off →
 * 527-529 skipped) and the boss defeat rule. Lamp rows come from the lamp
 * table; the two small-key self-allowances live in the item-rules table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys, placedAt,
} from '../combinators';
import { canBombOrBonk, canShootArrows, canUseBombs } from '../../state-helpers';
import { actGate } from '../../events';
import { dungeonBossDefeat } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

const bombs = (state: CollectionState): boolean => canUseBombs(state);
const arrows = (state: CollectionState): boolean => canShootArrows(state);

const DARK_PALACE_RULES: readonly RuleEntry[] = [
  // default_rules 681: the gatekeeper wants the real traveler, and the door is opened once,
  // by the porter who was hired for it. No inventory says whether he was, so a world with no
  // record to read keeps the old answer.
  { kind: 'exit', target: 'Palace of Darkness', mode: 'set', rule: allOf(hasItem(ITEM.moonPearl), actGate('check-332')) },
  // 519-521
  { kind: 'exit', target: 'Palace of Darkness Bonk Wall', mode: 'set', rule: allOf(canBombOrBonk, arrows) },
  { kind: 'exit', target: 'Palace of Darkness Hammer Peg Drop', mode: 'set', rule: hasItem(ITEM.hammer) },
  // 522-524
  {
    kind: 'exit', target: 'Palace of Darkness Bridge Room', mode: 'set',
    rule: hasKeys(ITEM.smallKeyPalaceOfDarkness, 1),
  },
  {
    kind: 'exit', target: 'Palace of Darkness Big Key Door', mode: 'set',
    rule: allOf(
      hasKeys(ITEM.smallKeyPalaceOfDarkness, 6),
      hasItem(ITEM.bigKeyPalaceOfDarkness),
      arrows,
      hasItem(ITEM.hammer),
    ),
  },
  { kind: 'exit', target: 'Palace of Darkness (North)', mode: 'set', rule: hasKeys(ITEM.smallKeyPalaceOfDarkness, 4) },
  // 525-526
  {
    kind: 'location', target: 'check-153', mode: 'set',
    rule: allOf(bombs, hasItem(ITEM.bigKeyPalaceOfDarkness)),
  },
  { kind: 'location', target: 'check-146', mode: 'set', rule: bombs },
  // 531-532
  {
    kind: 'exit', target: 'Palace of Darkness Big Key Chest Staircase', mode: 'set',
    rule: allOf(bombs, anyOf(
      hasKeys(ITEM.smallKeyPalaceOfDarkness, 6),
      allOf(
        placedAt('check-145', ITEM.smallKeyPalaceOfDarkness),
        hasKeys(ITEM.smallKeyPalaceOfDarkness, 3),
      ),
    )),
  },
  // 536-537
  {
    kind: 'exit', target: 'Palace of Darkness Spike Statue Room Door', mode: 'set',
    rule: anyOf(
      hasKeys(ITEM.smallKeyPalaceOfDarkness, 6),
      allOf(
        placedAt('check-154', ITEM.smallKeyPalaceOfDarkness),
        hasKeys(ITEM.smallKeyPalaceOfDarkness, 4),
      ),
    ),
  },
  // 541
  { kind: 'exit', target: 'Palace of Darkness Maze Door', mode: 'set', rule: hasKeys(ITEM.smallKeyPalaceOfDarkness, 6) },
  // dungeon_boss_rules
  { kind: 'location', target: 'check-155', mode: 'add', rule: dungeonBossDefeat('dungeon-006') },
  { kind: 'location', target: 'check-156', mode: 'add', rule: dungeonBossDefeat('dungeon-006') },
];

export { DARK_PALACE_RULES };
