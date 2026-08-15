/* @layer renderer-app @kind logic */
/**
 * The shared tail every record creator ends with: publish the newly minted id
 * as a pickable option and rebuild its collection's `CollectionSource` so the
 * table shows the new row without a reload.
 *
 * Split out of record-creators.ts so `create-connection.ts` (the pair-aware
 * connection creator, which settles TWO ids per accepted create) can share it
 * rather than carrying a second copy of the same two calls that could drift
 * out of step with this one.
 */
import { bumpDataRevision } from '@app/lib/game/data-revision';
import { refreshCollectionSource } from './collection-sources';
import { registerIdRefOption } from './id-ref-options';
import { resolveRecordLabel } from './record-links';
import type { EntityKind } from '@shared/game/data';

const settleCreatedRecord = (kind: EntityKind, id: string): { success: true; id: string } => {
  registerIdRefOption(kind, { value: id, label: resolveRecordLabel(id), description: id });
  refreshCollectionSource(kind);
  bumpDataRevision();
  return { success: true, id };
};

export { settleCreatedRecord };
