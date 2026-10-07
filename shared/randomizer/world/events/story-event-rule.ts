/* @layer shared-game @kind logic */
/**
 * How a rule asks for a story event found in the world: it has happened. The sweep grants it
 * where it happens (event-sweep.ts) and the record grants it on a live file, so holding it is
 * the whole question. An id that is not one of those events is a build-time error.
 */
import { WORLD_EVENT_IDS } from './story-events.data';
import { compileRule } from '../rules/rule-eval';
import { has } from '../rules/rule-node-build';
import type { CheckId } from '@shared/game/data/types/ids';
import type { Rule } from '../world.type';

const WORLD_EVENTS: ReadonlySet<CheckId> = new Set(WORLD_EVENT_IDS);

const storyEvent = (checkId: CheckId): Rule => {
  if (!WORLD_EVENTS.has(checkId)) throw new Error(`not a story event of the world: ${checkId}`);
  return compileRule(has(checkId));
};

export { storyEvent };
