/* @layer shared-game @kind data */
/**
 * The swamp palace, from Archipelago worlds/alttp/Rules.py: global_rules
 * 390-410 (pot shuffle off → 396-398 and 408-410 skipped) plus the moat
 * mirror requirement (109-110: the swamp was not moved, entrance shuffle is
 * vanilla) and the boss defeat rule. The big-key forbid and self-allowance
 * live in the item-rules table.
 */
import { ITEM } from '../../item-ids.data';
import {
  allOf, hasItem, hasKeys,
} from '../combinators';
import { bombs } from '../helper-rules';
import { STORY_EVENT, storyEvent } from '../../events';
import { dungeonBossDefeat } from './bosses.data';
import type { RuleEntry } from '../rule-entry.type';

const SWAMP_RULES: readonly RuleEntry[] = [
  // 390, then 109-110 adds the mirror (unmoved swamp under no-glitches).
  {
    kind: 'exit', target: 'Swamp Palace Moat', mode: 'set',
    rule: allOf(hasItem(ITEM.flippers), storyEvent(STORY_EVENT.floodgateLeverPulled)),
  },
  { kind: 'exit', target: 'Swamp Palace Moat', mode: 'add', rule: hasItem(ITEM.magicMirror) },
  // 391-395
  { kind: 'exit', target: 'Swamp Palace Small Key Door', mode: 'set', rule: hasKeys(ITEM.smallKeySwampPalace, 1) },
  { kind: 'location', target: 'check-158', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-169', mode: 'set', rule: hasKeys(ITEM.smallKeySwampPalace, 2) },
  {
    kind: 'exit', target: 'Swamp Palace (Center)', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), hasKeys(ITEM.smallKeySwampPalace, 3)),
  },
  { kind: 'location', target: 'check-170', mode: 'set', rule: hasItem(ITEM.hookshot) },
  // 399-403
  { kind: 'exit', target: 'Swamp Palace (West)', mode: 'set', rule: hasKeys(ITEM.smallKeySwampPalace, 6) },
  { kind: 'location', target: 'check-159', mode: 'set', rule: hasItem(ITEM.bigKeySwampPalace) },
  {
    kind: 'exit', target: 'Swamp Palace (North)', mode: 'set',
    rule: allOf(hasItem(ITEM.hookshot), hasKeys(ITEM.smallKeySwampPalace, 5)),
  },
  // dungeon_boss_rules, then 406-407 add the full key count.
  { kind: 'location', target: 'check-166', mode: 'add', rule: dungeonBossDefeat('dungeon-007') },
  { kind: 'location', target: 'check-167', mode: 'add', rule: dungeonBossDefeat('dungeon-007') },
  { kind: 'location', target: 'check-166', mode: 'add', rule: hasKeys(ITEM.smallKeySwampPalace, 6) },
  { kind: 'location', target: 'check-167', mode: 'add', rule: hasKeys(ITEM.smallKeySwampPalace, 6) },
];

export { SWAMP_RULES };
