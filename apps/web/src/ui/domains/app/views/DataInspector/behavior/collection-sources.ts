/* @layer renderer-app @kind logic */
/**
 * The eleven dataset collections as `CollectionSource`s. Adding a collection is
 * this file and nothing else. Rows are read once per collection, on first use,
 * and kept: writes go to the source files on disk, not the in-memory registry,
 * so a stable array is correct and keeps the derived schema memo stable.
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

/** Same emitters the write path uses, so the source tab shows exactly what a save would produce. */
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

const built = new Map<EntityKind, InspectorSource>();

const collectionSource = (kind: EntityKind): InspectorSource => {
  const ready = built.get(kind);
  if (ready) return ready;
  const source = sourceFor(kind);
  built.set(kind, source);
  return source;
};

/**
 * Built lazily on first read, not at module scope. record-writers,
 * id-ref-options and this file form an import cycle; building at module scope
 * ran while RECORD_WRITERS was still undefined and every collection silently
 * lost its write path. See tests/data-inspector/module-init-order.keep.test.ts.
 */
const COLLECTION_SOURCES = Object.defineProperties(
  {},
  Object.fromEntries(ENTITY_KINDS.map(kind => [kind, {
    get: () => collectionSource(kind),
    enumerable: true,
    configurable: true,
  }])),
) as Record<EntityKind, InspectorSource>;

/** Drops a cached source so the next read sees a newly minted record. `rows` is
 *  a snapshot, so anything that grows a collection must call this. */
const refreshCollectionSource = (kind: EntityKind): void => {
  built.delete(kind);
};

export { COLLECTION_SOURCES, refreshCollectionSource };
