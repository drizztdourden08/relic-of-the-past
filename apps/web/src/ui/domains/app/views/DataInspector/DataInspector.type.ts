/* @layer renderer-app @kind types */
import type { EntityKind } from '@shared/game/data';
import type { CollectionSource } from '@ds/data';

/** Composites read by dot path off untyped rows; concrete record types are only
 *  needed where a serializer or writer is chosen (collection-sources.ts). */
type InspectorRow = Record<string, unknown>;

type InspectorSource = CollectionSource<InspectorRow>;

/**
 * One of the eleven real collections, or the recommendations pseudo-collection
 * (findings about the dataset, not records in it). Not a twelfth `EntityKind`:
 * it has no record, no id prefix, and no `COLLECTION_SOURCES` entry (asking
 * for one would throw).
 */
type InspectorKind = EntityKind | 'recommendations';

/** What a clicked id reference resolved to, ready to select. */
interface IdRefTarget {
  kind: EntityKind;
  id: string;
  /** The referenced record's display name, for a status line or a title. */
  label: string;
}

export type { IdRefTarget, InspectorKind, InspectorRow, InspectorSource };
