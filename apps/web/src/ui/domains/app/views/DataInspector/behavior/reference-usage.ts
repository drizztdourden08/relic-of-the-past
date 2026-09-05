/* @layer renderer-app @kind logic */
/**
 * The usage-overview half of the delete guard: calls `referencesTo` and turns
 * each hit's id into a display label. The design system only ever sees the
 * plain strings and labels `ReferencedBy` renders.
 */
import { REFERENCE_TARGETS, referencesTo } from '@shared/game/data/relationships/reference-index';
import { resolveRecordLabel } from './record-links';
import type { ReferenceTarget } from '@shared/game/data/relationships/reference-index';
import type { ReferencedByHit } from '@ds/composites/RecordEditor';

/** Taken from the index itself, so a collection is guarded the moment it has a reverse lookup. */
const isReferenceGuarded = (collectionKind: string): collectionKind is ReferenceTarget =>
  (REFERENCE_TARGETS as readonly string[]).includes(collectionKind);

/** Empty for any collection this screen has no reverse-reference index for. */
const referencedByHitsFor = (collectionKind: string, id: string): readonly ReferencedByHit[] => {
  if (!isReferenceGuarded(collectionKind)) return [];
  return referencesTo(collectionKind, id).map(hit => ({
    kind: hit.kind,
    id: hit.id,
    field: hit.field,
    label: resolveRecordLabel(hit.id),
  }));
};

export { isReferenceGuarded, referencedByHitsFor };
