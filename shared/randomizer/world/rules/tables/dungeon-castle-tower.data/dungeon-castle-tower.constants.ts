/* @layer shared-game @kind constants */
import { ITEM } from '../../../item-ids.data';
import {
  allOf, anyOf, hasItem, hasKeys,
} from '../../combinators';
import { hasSword, kill } from '../../helper-rules';
import { STORY_EVENT, actGate, storyEvent } from '../../../events';
import { compileRule } from '../../rule-eval';
import { all, has, option } from '../../rule-node-build';
import { dungeonBossDefeat } from '../bosses.data';
import { barrierRule } from '../../story-gate-rules';
import type { RuleEntry } from '../../rule-entry.type';

const SEAL_TAKES_HAMMER = compileRule(all(option('itemPower.hammerTowerSeal', true), has(ITEM.hammer)));

const BLADELESS_SEED = compileRule(option('progressive.swordless', true));

const CASTLE_TOWER_RULES: readonly RuleEntry[] = [
  {
    kind: 'exit', target: 'Agahnims Tower', mode: 'set',
    rule: anyOf(
      hasItem(ITEM.cape), actGate('check-314'), SEAL_TAKES_HAMMER, barrierRule, storyEvent(STORY_EVENT.agahnim1Beaten),
    ),
  },
  {
    kind: 'exit', target: 'Agahnim 1', mode: 'set',
    rule: allOf(
      anyOf(hasSword, allOf(BLADELESS_SEED, anyOf(hasItem(ITEM.hammer), hasItem(ITEM.bugCatchingNet)))),
      hasKeys(ITEM.smallKeyAgahnimsTower, 4),
    ),
  },
  { kind: 'event', target: STORY_EVENT.agahnim1Beaten, mode: 'add', rule: dungeonBossDefeat('dungeon-002') },
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
