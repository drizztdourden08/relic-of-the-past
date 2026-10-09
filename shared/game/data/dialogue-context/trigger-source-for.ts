/* @layer shared-game @kind logic */
import type { TriggerSourceRow } from './dialogue-context.type';
import { triggerSourceById } from './trigger-source-by-id';

const triggerSourceFor = (id: number): TriggerSourceRow | null => triggerSourceById.get(id) ?? null;

export { triggerSourceFor };
