/* @layer renderer-app @kind logic */
import { referencesTo } from '@rotp/game-data';
import type { ReferencedByHit } from '@drizztdourden08/tessera/composites';
import { resolveRecordLabel } from '../record-links';
import { isReferenceGuarded } from './is-reference-guarded';

const referencedByHitsFor = (collectionKind: string, id: string): readonly ReferencedByHit[] => {
  if (!isReferenceGuarded(collectionKind)) return [];
  return referencesTo(collectionKind, id).map(hit => ({
    kind: hit.kind,
    id: hit.id,
    field: hit.field,
    label: resolveRecordLabel(hit.id),
  }));
};

export { referencedByHitsFor };
