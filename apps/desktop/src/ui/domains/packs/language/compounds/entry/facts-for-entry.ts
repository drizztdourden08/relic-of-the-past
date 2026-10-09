/* @layer renderer-components @kind logic */
import { triggerSourceFor } from '@shared/game/data/dialogue-context';
import { triggerFactsOf } from './trigger-facts';
import type { TriggerFacts } from './entry.type';

const factsByEntryId = new Map<number, TriggerFacts>();

const factsForEntry = (id: number): TriggerFacts => {
  const hit = factsByEntryId.get(id);
  if (hit !== undefined) return hit;
  const facts = triggerFactsOf(triggerSourceFor(id));
  factsByEntryId.set(id, facts);
  return facts;
};

export { factsForEntry };
