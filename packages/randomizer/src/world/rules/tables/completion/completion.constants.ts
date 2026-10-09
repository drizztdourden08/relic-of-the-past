/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids';
import { REGION } from '../../../region-ids.constants';
import {
  allOf, anyOf, canReach, hasItem,
} from '../../combinators';
import { hasBeamSword } from '../../helper-rules';
import { ganonRule, pyramidHoleRule } from '../../story-gate-rules';
import { GOAL_EVENT, STORY_EVENT, actGate, storyEvent } from '../../../events';
import { ganonDefeat, lastFightTakesHammer } from '../bosses';
import type { RuleEntry } from '../../rule-entry.type';

const CROSS_PEG_BRIDGE = allOf(hasItem(ITEM.hammer), hasItem(ITEM.moonPearl));

const COMPLETION_RULES: readonly RuleEntry[] = [
  { kind: 'event', target: GOAL_EVENT, mode: 'set', rule: ganonDefeat },
  { kind: 'event', target: GOAL_EVENT, mode: 'add', rule: storyEvent(STORY_EVENT.agahnim2Beaten) },
  { kind: 'event', target: GOAL_EVENT, mode: 'add', rule: ganonRule },
  { kind: 'exit', target: 'Ganon Drop', mode: 'set', rule: anyOf(hasBeamSword, lastFightTakesHammer) },
  { kind: 'exit', target: 'Pyramid Hole', mode: 'set', rule: pyramidHoleRule },
  {
    kind: 'exit', target: 'Pyramid Fairy', mode: 'set',
    rule: allOf(
      canReach(REGION.eastDarkWorld), canReach(REGION.bigBombShop), actGate('check-342'),
    ),
  },
  {
    kind: 'exit', target: 'Pyramid Fairy', mode: 'add',
    rule: anyOf(CROSS_PEG_BRIDGE, allOf(hasItem(ITEM.magicMirror), storyEvent(STORY_EVENT.agahnim1Beaten))),
  },
];

export { COMPLETION_RULES };
