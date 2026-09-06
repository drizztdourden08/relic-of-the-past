/* @layer renderer-app @kind logic */
/**
 * The shared tail every record creator ends with: publish the new id as a
 * pickable option and rebuild the `CollectionSource` so the table shows the
 * row without a reload. Shared with `create-connection.ts`, which settles two ids.
 */
import { refreshCollectionSource } from './collection-sources';
import { registerIdRefOption } from './id-ref-options';
import { resolveRecordLabel } from './record-links';
import type { EntityKind } from '@shared/game/data';

const settleCreatedRecord = (kind: EntityKind, id: string): { success: true; id: string } => {
  registerIdRefOption(kind, { value: id, label: resolveRecordLabel(id), description: id });
  refreshCollectionSource(kind);
  return { success: true, id };
};

export { settleCreatedRecord };
