/* @layer renderer-app @kind logic */
import { bumpDataRevision } from '@app/lib/game/data-revision';
import type { EntityKind } from '@shared/game/data';
import { refreshCollectionSource } from './collection-sources';
import { registerIdRefOption } from './register-id-ref-option';
import { resolveRecordLabel } from './record-links';

const settleCreatedRecord = (kind: EntityKind, id: string): { success: true; id: string } => {
  registerIdRefOption(kind, { value: id, label: resolveRecordLabel(id), description: id });
  refreshCollectionSource(kind);
  bumpDataRevision();
  return { success: true, id };
};

export { settleCreatedRecord };
