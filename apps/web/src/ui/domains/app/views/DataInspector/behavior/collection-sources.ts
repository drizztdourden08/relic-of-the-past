/* @layer renderer-app @kind logic */
/**
 * Adapter: the eleven dataset collections, each expressed as the one interface
 * the generic composites understand.
 *
 * A `CollectionSource` is the whole contract — rows, how to identify one, and
 * optionally a config diff, a serializer and a write path. Everything else
 * (which fields exist, what filters them, how a cell renders, what form edits
 * it) is derived from the rows, so adding another collection here is this
 * file and nothing else.
 *
 * Rows are read once at module load. The facade is seeded synchronously by its
 * own barrel before anything can import from it, and a write goes to the source
 * files on disk rather than to the in-memory registry, so a stable array per
 * collection is both correct and what keeps the derived schema memo stable.
 */
import { all } from '@shared/game/data';
import {
  serializeActorRecord, serializeAreaRecord, serializeCheckRecord, serializeConnectionRecord,
  serializeDungeonRecord, serializeEnumerationRecord, serializeItemGroupRecord, serializeItemRecord,
  serializeLocationRecord, serializeScreenRecord, serializeTagRecord,
} from '@shared/game/data/record-codegen';
import type { EntityKind } from '@shared/game/data';
import { ENTITY_KINDS, KIND_NAV_ITEMS } from '../DataInspector.constants';
import { RECORD_WRITERS } from './record-writers';
import { SCHEMA_CONFIGS } from './schema-config';
import type { InspectorRow, InspectorSource } from '../DataInspector.type';

type Serializer = (row: InspectorRow) => string;

/**
 * The one place a concrete record type is still needed: the emitter is typed
 * per kind, and it is the same emitter the write path uses, so the source tab
 * shows exactly the text a save would produce.
 *
 * Partial rather than exhaustive, so a collection wired up later needs no
 * change here beyond adding its own entry.
 */
const SERIALIZERS: Partial<Record<EntityKind, Serializer>> = {
  screen: row => serializeScreenRecord(row as never),
  connection: row => serializeConnectionRecord(row as never),
  check: row => serializeCheckRecord(row as never),
  item: row => serializeItemRecord(row as never),
  dungeon: row => serializeDungeonRecord(row as never),
  area: row => serializeAreaRecord(row as never),
  location: row => serializeLocationRecord(row as never),
  actor: row => serializeActorRecord(row as never),
  tag: row => serializeTagRecord(row as never),
  'item-group': row => serializeItemGroupRecord(row as never),
  enumeration: row => serializeEnumerationRecord(row as never),
};

const LABELS: Record<string, string> = Object.fromEntries(
  KIND_NAV_ITEMS.map(item => [item.id, item.label]),
);

const sourceFor = (kind: EntityKind): InspectorSource => ({
  id: kind,
  label: LABELS[kind] ?? kind,
  rows: all(kind) as readonly unknown[] as readonly InspectorRow[],
  getId: row => String(row.id),
  config: SCHEMA_CONFIGS[kind],
  serialize: SERIALIZERS[kind],
  onSave: RECORD_WRITERS[kind],
});

const COLLECTION_SOURCES: Record<EntityKind, InspectorSource> = Object.fromEntries(
  ENTITY_KINDS.map(kind => [kind, sourceFor(kind)]),
) as Record<EntityKind, InspectorSource>;

/**
 * Rebuilds one collection's source after a record is minted into the live
 * registry. `rows` is read once at module load (see the note above), so a
 * created record is invisible to the table until this replaces the entry with
 * a fresh snapshot — the create flow calls this the moment its own write
 * lands, the same way a delete or an edit would need to if either ever grew a
 * collection instead of mutating one already in it.
 */
const refreshCollectionSource = (kind: EntityKind): void => {
  COLLECTION_SOURCES[kind] = sourceFor(kind);
};

export { COLLECTION_SOURCES, refreshCollectionSource };
