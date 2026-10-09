/* @layer shared-game @kind logic */
import type { TriggerSourceRow } from './dialogue-context.type';
import { triggerSourceRows } from './trigger-source';

const triggerSourceById: Map<number, TriggerSourceRow> = new Map(
  triggerSourceRows.map((row) => [row.id, row]),
);

export { triggerSourceById };
