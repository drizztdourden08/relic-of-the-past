/* @layer renderer-app @kind logic */
/**
 * Where an edited record can actually be written back.
 *
 * Five collections have a write path: screen and connection already existed
 * for the dev editor in the navigation widget, tag/item-group reuse the
 * delete-guard feature's own IPC channels the other way round — the same
 * round trip that removes a record can just as well replace it in place —
 * and enumeration gets the same "replace an id already open" write despite
 * having no delete-guard half of its own (nothing references an enumeration
 * entry's id, so there is nothing for a guard to check). Every other
 * collection is deliberately absent from the map below, which is what makes
 * its editor tab read-only — `RecordEditor` renders no save button when
 * `onSave` is omitted, so an unwritable collection is honest by construction
 * rather than by a disabled button.
 *
 * The six record-facade collections below them are uniform, and written as one
 * factory rather than six near-copies: send the whole record under its id, let
 * the main process find the file the record actually sits in, then fold the
 * result into the live session and refresh the label the id-ref pickers cache.
 */
import { isTagKey, replaceEnumerationRecord, replaceItemGroupRecord, replaceRecord, replaceTagRecord } from '@shared/game/data';
import { connectionRecordFile, screenRecordFile } from '@shared/game/data/record-file-targets';
import { variantBlockers } from '@shared/game/logic/queries/screen-validity';
import { bumpDataRevision } from '@app/lib/game/data-revision';
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

/**
 * The editor surfaces a rejected write as its own error, so a failure throws.
 * Every writer below ends here, which makes it the one place a landed edit can
 * be announced to whatever reads the dataset revision.
 */
const settle = (result: WriteRecordResult): void => {
  if (!result.success) throw new Error(result.error);
  bumpDataRevision();
};

const pathOf = (target: FileTarget): string => {
  if (!target.relativePath) throw new Error(target.unresolved ?? NO_TARGET);
  return target.relativePath;
};

/**
 * Guarded the same way `writeTag` is, and for the same reason: a variant states
 * its progress tier twice, and only one of the two is what the runtime reads,
 * so an edit that moves one and leaves the other is refused rather than stored.
 */
const writeScreen: RecordWriter = async (row) => {
  const { id, ...rest } = row as unknown as ScreenRecord;
  const variantIssue = variantBlockers(rest)[0];
  if (variantIssue) throw new Error(`This screen needs ${variantIssue}.`);
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

/**
 * Folds the edit back into the live registry on success, so a rename resolves
 * everywhere in the session with no reload. That includes the id-ref OPTIONS
 * cache (`id-ref-options.ts`) as well as the registry itself — a screen's tag
 * chips read a tag's label through that cache, not through the registry
 * directly, so updating only the registry would leave the chip showing the
 * old label until the cache was rebuilt from scratch.
 */
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

/**
 * Same round trip as `writeTag`/`writeItemGroupRecord`, minus the reference
 * guard neither of those actually needs here — nothing stores a foreign-key
 * reference to an enumeration entry's id (see reference-usage.ts), only the
 * "fold the edit back into the live registry" half applies.
 */
const writeEnumerationRecord: RecordWriter = async (row) => {
  const record = row as unknown as EnumerationEntry;
  const { id, ...rest } = record;
  settle(await window.api.screenEditor.writeEnumeration({ enumerationId: id, record: rest as PendingEnumerationRecord }));
  replaceEnumerationRecord(record);
  updateIdRefOption('enumeration', id);
};

/**
 * One write-back for a record-facade collection. The channel is the only thing
 * that differs, so it is the only thing passed in — and no destination goes
 * with it, because the main process locates the record by the id it already
 * carries rather than re-deriving where it ought to live.
 */
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
