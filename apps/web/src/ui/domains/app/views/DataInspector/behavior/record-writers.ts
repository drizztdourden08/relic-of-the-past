/* @layer renderer-app @kind logic */
/**
 * Where an edited record is written back. A collection absent from the map is
 * read-only by construction: `RecordEditor` renders no save button when
 * `onSave` is omitted. The record-facade collections share one factory: send
 * the whole record under its id, let the main process find its file, then
 * fold the result into the live session and refresh the id-ref picker label.
 */
import { isTagKey, replaceEnumerationRecord, replaceItemGroupRecord, replaceRecord, replaceTagRecord } from '@shared/game/data';
import { connectionRecordFile, screenRecordFile } from '@shared/game/data/record-file-targets';
import { invalidateTagSuggestions } from './tag-suggestions';
import { updateIdRefOption } from './id-ref-options';
import type {
  ActorRecord, AreaRecord, CheckRecord, ConnectionRecord, DungeonRecord, EntityKind, EnumerationEntry,
  ItemGroupRecord, ItemRecord, LocationRecord, ScreenRecord, TagRecord,
} from '@shared/game/data';
import type { FileTarget } from '@shared/game/data/record-file-targets';
import type {
  PendingConnectionRecord, PendingEnumerationRecord, PendingItemGroupRecord, PendingScreenRecord, PendingTagRecord,
  Unnumbered,
} from '@shared/game/data/record-codegen';
import type { WriteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import type { InspectorRow } from '../DataInspector.type';

type RecordWriter = (row: InspectorRow) => Promise<void>;

const NO_TARGET = 'No source file could be derived for this record.';
const NAME_MISMATCH = "A tag's name must read namespace:value, matching its own namespace and value.";

/** The editor surfaces a rejected write as its own error, so a failure throws. */
const settle = (result: WriteRecordResult): void => {
  if (!result.success) throw new Error(result.error);
};

const pathOf = (target: FileTarget): string => {
  if (!target.relativePath) throw new Error(target.unresolved ?? NO_TARGET);
  return target.relativePath;
};

const writeScreen: RecordWriter = async (row) => {
  const { id, ...rest } = row as unknown as ScreenRecord;
  const filePath = pathOf(screenRecordFile({ id, ...rest }));
  settle(await window.api.screenEditor.writeScreen({
    filePath,
    record: rest as PendingScreenRecord,
    replaceId: id,
  }));
};

const writeConnection: RecordWriter = async (row) => {
  const { id, ...rest } = row as unknown as ConnectionRecord;
  const filePath = pathOf(connectionRecordFile(rest.screenId));
  settle(await window.api.screenEditor.writeConnections({
    mode: 'replace',
    filePath,
    connectionId: id,
    record: rest as PendingConnectionRecord,
  }));
};

/** Folds the edit into the live registry and the id-ref options cache: tag
 *  chips read labels through that cache, so the registry alone is not enough. */
const writeTag: RecordWriter = async (row) => {
  const record = row as unknown as TagRecord;
  const { id, ...rest } = record;
  const expectedName = `${record.namespace}:${record.value}`;
  if (!isTagKey(record.name) || record.name !== expectedName) throw new Error(NAME_MISMATCH);
  settle(await window.api.screenEditor.writeTag({ tagId: id, record: rest as PendingTagRecord }));
  replaceTagRecord(record);
  invalidateTagSuggestions();
  updateIdRefOption('tag', id);
};

/** Same bargain as `writeTag`, for the other reference-guarded kind. */
const writeItemGroupRecord: RecordWriter = async (row) => {
  const record = row as unknown as ItemGroupRecord;
  const { id, ...rest } = record;
  settle(await window.api.screenEditor.writeItemGroup({ groupId: id, record: rest as PendingItemGroupRecord }));
  replaceItemGroupRecord(record);
  updateIdRefOption('item-group', id);
};

/** Same round trip as `writeTag`, minus the reference guard: nothing references an enumeration entry's id. */
const writeEnumerationRecord: RecordWriter = async (row) => {
  const record = row as unknown as EnumerationEntry;
  const { id, ...rest } = record;
  settle(await window.api.screenEditor.writeEnumeration({ enumerationId: id, record: rest as PendingEnumerationRecord }));
  replaceEnumerationRecord(record);
  updateIdRefOption('enumeration', id);
};

/** One write-back for a record-facade collection. No destination is passed; the main process locates the record by id. */
const facadeWriter = <T extends { id: string }>(
  kind: EntityKind,
  send: (args: WriteRecordArgs<T>) => Promise<WriteRecordResult>,
): RecordWriter => async (row) => {
  const record = row as unknown as T;
  const { id, ...rest } = record;
  settle(await send({ id, record: rest as Unnumbered<T> }));
  replaceRecord(kind, record);
  updateIdRefOption(kind, id);
};

const editor = (): typeof window.api.screenEditor => window.api.screenEditor;

const RECORD_WRITERS: Partial<Record<EntityKind, RecordWriter>> = {
  screen: writeScreen,
  connection: writeConnection,
  tag: writeTag,
  'item-group': writeItemGroupRecord,
  enumeration: writeEnumerationRecord,
  check: facadeWriter<CheckRecord>('check', args => editor().writeCheckRecord(args)),
  item: facadeWriter<ItemRecord>('item', args => editor().writeItemRecord(args)),
  dungeon: facadeWriter<DungeonRecord>('dungeon', args => editor().writeDungeonRecord(args)),
  area: facadeWriter<AreaRecord>('area', args => editor().writeAreaRecord(args)),
  location: facadeWriter<LocationRecord>('location', args => editor().writeLocationRecord(args)),
  actor: facadeWriter<ActorRecord>('actor', args => editor().writeActorRecord(args)),
};

export { RECORD_WRITERS };
export type { RecordWriter };
