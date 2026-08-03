/* @layer renderer-app @kind types */
import type { EntityKind } from '@shared/game/data';
import type { CollectionSource } from '@ds/data';

/**
 * Records reach the generic composites as plain bags: every one of them reads by
 * dot path off an untyped row, so the concrete record interfaces are only needed
 * where a serializer or a writer is chosen (collection-sources.ts).
 */
type InspectorRow = Record<string, unknown>;

type InspectorSource = CollectionSource<InspectorRow>;

/**
 * What the screen can be showing: one of the eleven real collections, or the
 * recommendations pseudo-collection — rows that are FINDINGS about the dataset
 * rather than records in it. It is a separate literal rather than a twelfth
 * `EntityKind` because nothing outside this screen has one to store, write or
 * reference: there is no `Data/recommendations` record, no id prefix, and no
 * `COLLECTION_SOURCES` entry (asking for one would throw).
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
