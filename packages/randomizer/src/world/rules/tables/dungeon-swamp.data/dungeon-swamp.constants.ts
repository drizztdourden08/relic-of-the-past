/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, hasItem, hasKeys,
} from '../../combinators';
import { bombs } from '../../helper-rules';
import { STORY_EVENT, storyEvent } from '../../../events';
import { dungeonBossDefeat } from '../bosses.data';
import type { RuleEntry } from '../../rule-entry.type';

const SWAMP_RULES: readonly RuleEntry[] = [
  {
    kind: 'exit', target: 'Swamp Palace Moat', mode: 'set',
    rule: allOf(hasItem(ITEM.flippers), storyEvent(STORY_EVENT.floodgateLeverPulled)),
  },
  { kind: 'exit', target: 'Swamp Palace Moat', mode: 'add', rule: hasItem(ITEM.magicMirror) },
  { kind: 'exit', target: 'Swamp Palace Small Key Door', mode: 'set', rule: hasKeys(ITEM.smallKeySwampPalace, 1) },
  { kind: 'location', target: 'check-158', mode: 'set', rule: bombs() },
  { kind: 'location', target: 'check-169', mode: 'set', rule: hasKeys(ITEM.smallKeySwampPalace, 2) },
  {
    kind: 'exit', target: 'Swamp Palace (Center)', mode: 'set',
    rule: allOf(hasItem(ITEM.hammer), hasKeys(ITEM.smallKeySwampPalace, 3)),
  },
  { kind: 'location', target: 'check-170', mode: 'set', rule: hasItem(ITEM.hookshot) },
  { kind: 'exit', target: 'Swamp Palace (West)', mode: 'set', rule: hasKeys(ITEM.smallKeySwampPalace, 6) },
  { kind: 'location', target: 'check-159', mode: 'set', rule: hasItem(ITEM.bigKeySwampPalace) },
  {
    kind: 'exit', target: 'Swamp Palace (North)', mode: 'set',
    rule: allOf(hasItem(ITEM.hookshot), hasKeys(ITEM.smallKeySwampPalace, 5)),
  },
  { kind: 'location', target: 'check-166', mode: 'add', rule: dungeonBossDefeat('dungeon-007') },
  { kind: 'location', target: 'check-167', mode: 'add', rule: dungeonBossDefeat('dungeon-007') },
  { kind: 'location', target: 'check-166', mode: 'add', rule: hasKeys(ITEM.smallKeySwampPalace, 6) },
  { kind: 'location', target: 'check-167', mode: 'add', rule: hasKeys(ITEM.smallKeySwampPalace, 6) },
];

export { SWAMP_RULES };
