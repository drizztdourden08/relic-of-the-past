/* @layer shared-game @kind data */
/**
 * The swamp-of-despair dungeon, from Archipelago worlds/alttp/Rules.py:
 * the medallion entrance (default_rules 716, sword required to cast, the
 * per-seed medallion resolved through the world options), global_rules
 * 463-488 (can_take_damage true keeps the hearts alternative live) and the
 * boss defeat rule. The vitreous-room lamp comes from the lamp table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, anyOf, either, hasItem, hasKeys, placedAt,
} from '../combinators';
import {
  arrows, bombs, canActivateCrystalSwitch, hasFireSource, hasSword, hearts,
} from '../helper-rules';
import { actGate } from '../../events';
import { dungeonBossDefeat } from './bosses.data';
import type { RuleEntry } from '../rule-entry.type';

/** 478-482: a key placed west is safe only when the big key locks it. */
const bigKeyLocksWest = anyOf(
  placedAt('check-213', ITEM.bigKeyMiseryMire),
  placedAt('check-214', ITEM.bigKeyMiseryMire),
);

const MIRE_RULES: readonly RuleEntry[] = [
  // default_rules 716
  {
    kind: 'exit', target: 'Misery Mire', mode: 'set',
    // The medallion opened it once and the seal stays down, so the act carries the casting.
    rule: allOf(hasItem(ITEM.moonPearl), actGate('check-344')),
  },
  // 463
  {
    kind: 'exit', target: 'Misery Mire Entrance Gap', mode: 'set',
    rule: allOf(
      anyOf(hasItem(ITEM.pegasusBoots), hasItem(ITEM.hookshot)),
      anyOf(
        hasSword, hasItem(ITEM.fireRod), hasItem(ITEM.iceRod), hasItem(ITEM.hammer),
        hasItem(ITEM.caneOfSomaria), arrows(),
      ),
    ),
  },
  // 464-468
  {
    kind: 'location', target: 'check-218', mode: 'set',
    rule: anyOf(hasItem(ITEM.bigKeyMiseryMire), hasKeys(ITEM.smallKeyMiseryMire, 4)),
  },
  { kind: 'location', target: 'check-208', mode: 'set', rule: hasItem(ITEM.bigKeyMiseryMire) },
  {
    kind: 'location', target: 'check-212', mode: 'set',
    rule: anyOf(
      hearts(4),
      hasItem(ITEM.caneOfByrna),
      hasItem(ITEM.cape),
    ),
  },
  { kind: 'exit', target: 'Misery Mire Big Key Door', mode: 'set', rule: hasItem(ITEM.bigKeyMiseryMire) },
  // 470-476
  {
    kind: 'location', target: 'check-209', mode: 'set',
    rule: anyOf(
      allOf(hasKeys(ITEM.smallKeyMiseryMire, 2), canActivateCrystalSwitch),
      hasKeys(ITEM.smallKeyMiseryMire, 4),
    ),
  },
  {
    kind: 'location', target: 'check-210', mode: 'set',
    rule: anyOf(
      allOf(hasKeys(ITEM.smallKeyMiseryMire, 3), canActivateCrystalSwitch),
      hasKeys(ITEM.smallKeyMiseryMire, 5),
    ),
  },
  // 478-482
  {
    kind: 'location', target: 'check-219', mode: 'set',
    rule: either(
      anyOf(bigKeyLocksWest, placedAt('check-219', ITEM.bigKeyMiseryMire)),
      hasKeys(ITEM.smallKeyMiseryMire, 4),
      hasKeys(ITEM.smallKeyMiseryMire, 5),
    ),
  },
  // 483-485
  {
    kind: 'exit', target: 'Misery Mire (West)', mode: 'set',
    rule: either(
      bigKeyLocksWest,
      hasKeys(ITEM.smallKeyMiseryMire, 5),
      hasKeys(ITEM.smallKeyMiseryMire, 6),
    ),
  },
  // 486-488
  { kind: 'location', target: 'check-213', mode: 'set', rule: hasFireSource },
  { kind: 'location', target: 'check-214', mode: 'set', rule: hasFireSource },
  {
    kind: 'exit', target: 'Misery Mire (Vitreous)', mode: 'set',
    rule: allOf(hasItem(ITEM.caneOfSomaria), bombs()),
  },
  // dungeon_boss_rules
  { kind: 'location', target: 'check-215', mode: 'add', rule: dungeonBossDefeat('dungeon-011') },
  { kind: 'location', target: 'check-216', mode: 'add', rule: dungeonBossDefeat('dungeon-011') },
];

export { MIRE_RULES };
