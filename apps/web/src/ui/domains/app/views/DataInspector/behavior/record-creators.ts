/* @layer renderer-app @kind logic */
/**
 * Where a brand-new record actually gets minted — the create-flow's
 * counterpart to `record-writers.ts`.
 *
 * Every collection here predates the record facade in its OWN way (a tag's
 * key, an item group's members, a geography record's world/area — see
 * `shared/ipc/screen-editor-contract.ts`), except the four that came after,
 * which all share one generic `Allocate*` shape. Screen and connection have no
 * `Allocate*` channel of their own at all: a brand-new one goes through the
 * same `writeScreen`/`writeConnections` channel an edit does, with no id
 * supplied, which is what tells the main process to allocate one instead of
 * replacing.
 *
 * Every creator ends the same way regardless of its own shape: fold the
 * allocated record into the live registry, add it to the id-ref option list
 * this collection's own references resolve through, and rebuild this kind's
 * `CollectionSource` so the table shows the new row without a reload.
 */
import {
  isTagKey, registerEnumerationRecord, registerItemGroupRecord, registerRecord, registerTag,
} from '@shared/game/data';
import { connectionRecordFile, screenRecordFile } from '@shared/game/data/record-file-targets';
import { refreshCollectionSource } from './collection-sources';
import { invalidateTagSuggestions } from './tag-suggestions';
import { registerIdRefOption } from './id-ref-options';
import { resolveRecordLabel } from './record-links';
import type {
  ActorRecord, AreaRecord, CheckRecord, ConnectionRecord, DungeonRecord, EntityKind, EnumerationEntry,
  ItemGroupRecord, ItemRecord, LocationRecord, ScreenRecord, TagRecord,
} from '@shared/game/data';
import type { ScreenHome } from '@shared/game/data/record-file-targets';
import type { PendingConnectionRecord, PendingScreenRecord, Unnumbered } from '@shared/game/data/record-codegen';
import type { AllocateRecordArgs, AllocateRecordResult } from '@shared/ipc/screen-editor-contract';
import type { InspectorRow } from '../DataInspector.type';

type CreateOutcome = { success: true; id: string } | { success: false; error: string };
type RecordCreator = (draft: InspectorRow) => Promise<CreateOutcome>;

const NO_TARGET = 'No source file could be derived for this record.';
const NOT_CONVENTION = 'Tags must be in the form namespace:value.';

/** Every creator's shared tail: publish the new id everywhere it needs to resolve. */
const settled = (kind: EntityKind, id: string): CreateOutcome => {
  registerIdRefOption(kind, { value: id, label: resolveRecordLabel(id), description: id });
  refreshCollectionSource(kind);
  return { success: true, id };
};

const createScreen: RecordCreator = async (draft) => {
  const target = screenRecordFile(draft as unknown as ScreenHome);
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_TARGET };
  const result = await window.api.screenEditor.writeScreen({
    filePath: target.relativePath,
    record: draft as unknown as PendingScreenRecord,
    replaceId: null,
  });
  if (!result.success) return { success: false, error: result.error };
  const id = result.ids[0];
  registerRecord('screen', { id, ...draft } as unknown as ScreenRecord);
  return settled('screen', id);
};

const createConnection: RecordCreator = async (draft) => {
  const record = draft as unknown as ConnectionRecord;
  const target = connectionRecordFile(record.fromScreenId, record.toScreenId);
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_TARGET };
  const result = await window.api.screenEditor.writeConnections({
    mode: 'insert',
    filePath: target.relativePath,
    records: [draft as unknown as PendingConnectionRecord],
  });
  if (!result.success) return { success: false, error: result.error };
  const id = result.ids[0];
  registerRecord('connection', { id, ...draft } as unknown as ConnectionRecord);
  return settled('connection', id);
};

const createTagRecord: RecordCreator = async (draft) => {
  const namespace = String(draft.namespace ?? '').trim();
  const value = String(draft.value ?? '').trim();
  const key = `${namespace}:${value}`;
  if (!isTagKey(key)) return { success: false, error: NOT_CONVENTION };
  const result = await window.api.screenEditor.allocateTag({
    key,
    appliesTo: (draft.appliesTo ?? []) as TagRecord['appliesTo'],
    label: draft.label as string | undefined,
    namespaceLabel: draft.namespaceLabel as string | undefined,
  });
  if (!result.success) return { success: false, error: result.error };
  registerTag(result.record);
  invalidateTagSuggestions();
  return settled('tag', result.record.id);
};

const createItemGroupRecord: RecordCreator = async (draft) => {
  const record = draft as unknown as ItemGroupRecord;
  const result = await window.api.screenEditor.allocateItemGroup({ label: record.label, memberIds: record.memberIds });
  if (!result.success) return { success: false, error: result.error };
  registerItemGroupRecord(result.record);
  return settled('item-group', result.record.id);
};

const createEnumerationRecord: RecordCreator = async (draft) => {
  const record = draft as unknown as EnumerationEntry;
  const result = await window.api.screenEditor.allocateEnumeration({
    category: record.category, value: record.value, label: record.label, appliesTo: record.appliesTo,
  });
  if (!result.success) return { success: false, error: result.error };
  registerEnumerationRecord(result.record);
  return settled('enumeration', result.record.id);
};

const createArea: RecordCreator = async (draft) => {
  const record = draft as unknown as AreaRecord;
  const result = await window.api.screenEditor.allocateGeography({
    kind: 'area', randomizerName: record.randomizerName, world: record.world,
  });
  if (!result.success) return { success: false, error: result.error };
  registerRecord('area', result.record);
  return settled('area', result.record.id);
};

const createLocation: RecordCreator = async (draft) => {
  const record = draft as unknown as LocationRecord;
  const result = await window.api.screenEditor.allocateGeography({
    kind: 'location', randomizerName: record.randomizerName, areaId: record.areaId,
  });
  if (!result.success) return { success: false, error: result.error };
  registerRecord('location', result.record);
  return settled('location', result.record.id);
};

/** One creator for a record-facade collection — the channel is the only thing
 *  that differs, mirroring `record-writers.ts`'s own `facadeWriter`. */
const facadeCreator = <T extends { id: string }>(
  kind: EntityKind,
  send: (args: AllocateRecordArgs<T>) => Promise<AllocateRecordResult<T>>,
): RecordCreator => async (draft) => {
  const result = await send({ record: draft as unknown as Unnumbered<T> });
  if (!result.success) return { success: false, error: result.error };
  registerRecord(kind, result.record);
  return settled(kind, result.record.id);
};

const editor = (): typeof window.api.screenEditor => window.api.screenEditor;

const RECORD_CREATORS: Partial<Record<EntityKind, RecordCreator>> = {
  screen: createScreen,
  connection: createConnection,
  tag: createTagRecord,
  'item-group': createItemGroupRecord,
  enumeration: createEnumerationRecord,
  area: createArea,
  location: createLocation,
  check: facadeCreator<CheckRecord>('check', args => editor().allocateCheck(args)),
  item: facadeCreator<ItemRecord>('item', args => editor().allocateItem(args)),
  dungeon: facadeCreator<DungeonRecord>('dungeon', args => editor().allocateDungeon(args)),
  actor: facadeCreator<ActorRecord>('actor', args => editor().allocateActor(args)),
};

export { RECORD_CREATORS };
export type { CreateOutcome, RecordCreator };
