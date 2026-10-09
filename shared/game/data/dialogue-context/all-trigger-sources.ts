/* @layer shared-game @kind logic */
import type { TriggerSourceRow } from './dialogue-context.type';
import { triggerSourceById } from './trigger-source-by-id';

const allTriggerSources = (): TriggerSourceRow[] => (
  [...triggerSourceById.values()].sort((a, b) => a.id - b.id)
);

export { allTriggerSources };
