/* @layer shared-game @kind logic */
/**
 * Lookup into the trigger-source dataset. Ids are 1-based, matching the editor's
 * entry numbering — see ./context.ts for the convention.
 */
import type { TriggerSourceRow } from './types';
import { triggerSourceRows } from './trigger-source';

const byId: Map<number, TriggerSourceRow> = new Map(
  triggerSourceRows.map((row) => [row.id, row]),
);

/** What opens entry `id`, or null when nothing is known about it. */
const triggerSourceFor = (id: number): TriggerSourceRow | null => byId.get(id) ?? null;

/** Every entry with a known source, in id order. */
const allTriggerSources = (): TriggerSourceRow[] => (
  [...byId.values()].sort((a, b) => a.id - b.id)
);

export { triggerSourceFor, allTriggerSources };
