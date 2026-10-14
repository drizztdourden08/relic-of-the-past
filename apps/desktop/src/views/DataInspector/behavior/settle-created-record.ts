/* @layer renderer-app @kind logic */
import { bumpDataRevision } from '@rotp/game-core';
import type { EntityKind } from '@rotp/game-data';
import { refreshCollectionSource } from '@app/data-inspector/collection-sources';
import { registerIdRefOption } from './register-id-ref-option';
import { resolveRecordLabel } from '@app/data-inspector/record-links';

const settleCreatedRecord = (kind: EntityKind, id: string): { success: true; id: string } => {
  registerIdRefOption(kind, { value: id, label: resolveRecordLabel(id), description: id });
  refreshCollectionSource(kind);
  bumpDataRevision();
  return { success: true, id };
};

export { settleCreatedRecord };
