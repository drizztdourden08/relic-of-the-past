/* @layer shared-game @kind logic */
import { WORLD_EVENTS } from './story-event-rule.constants';
import { compileRule } from '../rules/rule-eval';
import { has } from '../rules/rule-node-build';
import type { CheckId } from '@shared/game/data/types/ids';
import type { Rule } from '../world.type';

const storyEvent = (checkId: CheckId): Rule => {
  if (!WORLD_EVENTS.has(checkId)) throw new Error(`not a story event of the world: ${checkId}`);
  return compileRule(has(checkId));
};

export { storyEvent };
