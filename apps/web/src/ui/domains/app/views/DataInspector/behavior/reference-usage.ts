/* @layer renderer-app @kind logic */
/**
 * The usage-overview half of the delete-guard feature.
 *
 * `referencesTo` is shared-layer logic (kind + id in, hits out); this is the
 * one place allowed to call it AND to turn each hit's plain id into a display
 * label, exactly the handoff `record-links.ts` already makes for id-ref cells.
 * The design system never sees a real `EntityKind` or a dataset lookup — only
 * the plain strings and pre-resolved labels `ReferencedBy` renders.
 */
import { REFERENCE_TARGETS, referencesTo } from '@shared/game/data/relationships/reference-index';
import { resolveRecordLabel } from './record-links';
import type { ReferenceTarget } from '@shared/game/data/relationships/reference-index';
import type { ReferencedByHit } from '@ds/composites/RecordEditor';

/**
 * Which kinds `referencesTo` answers for — taken from the index itself rather
 * than restated here, so a collection that gains a reverse lookup is guarded
 * the moment it has one, and cannot be listed here without having one.
 */
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
