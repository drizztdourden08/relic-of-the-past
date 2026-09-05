/* @layer renderer-app @kind logic */
/**
 * Only kinds the reference index answers for are wired: a delete without a
 * reverse index has nothing to warn about. The main process writes the source
 * file first; the in-memory registry is updated only on success, so a failed
 * write never desyncs it from disk. Tag and item group keep their own lookup
 * maps, so each has its own unregister.
 */
import { unregisterItemGroupRecord, unregisterRecord, unregisterTag } from '@shared/game/data';
import { invalidateTagSuggestions } from './tag-suggestions';
import { unregisterIdRefOption } from './id-ref-options';
import type { EntityKind, ItemGroupId, TagId } from '@shared/game/data';
import type { DeleteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';

interface DeleteResult {
  success: boolean;
  error?: string;
}

const deleteTagRecord = async (id: string): Promise<DeleteResult> => {
  const result = await window.api.screenEditor.deleteTag({ tagId: id as TagId });
  if (!result.success) return { success: false, error: result.error };
  unregisterTag(id);
  invalidateTagSuggestions();
  unregisterIdRefOption('tag', id);
  return { success: true };
};

const deleteItemGroupRecord = async (id: string): Promise<DeleteResult> => {
  const result = await window.api.screenEditor.deleteItemGroup({ groupId: id as ItemGroupId });
  if (!result.success) return { success: false, error: result.error };
  unregisterItemGroupRecord(id);
  unregisterIdRefOption('item-group', id);
  return { success: true };
};

/** One delete for a record-facade collection. Only the channel differs. */
const facadeDeleter = (
  kind: EntityKind,
  send: (args: DeleteRecordArgs) => Promise<WriteRecordResult>,
) => async (id: string): Promise<DeleteResult> => {
  const result = await send({ id });
  if (!result.success) return { success: false, error: result.error };
  unregisterRecord(kind, id);
  unregisterIdRefOption(kind, id);
  return { success: true };
};

const editor = (): typeof window.api.screenEditor => window.api.screenEditor;

const DELETERS: Partial<Record<EntityKind, (id: string) => Promise<DeleteResult>>> = {
  tag: deleteTagRecord,
  'item-group': deleteItemGroupRecord,
  check: facadeDeleter('check', args => editor().deleteCheck(args)),
  item: facadeDeleter('item', args => editor().deleteItem(args)),
  dungeon: facadeDeleter('dungeon', args => editor().deleteDungeon(args)),
  area: facadeDeleter('area', args => editor().deleteArea(args)),
  location: facadeDeleter('location', args => editor().deleteLocation(args)),
  actor: facadeDeleter('actor', args => editor().deleteActor(args)),
};

/** Undefined for any collection this screen has no delete write path for. */
const recordDeleterFor = (collectionKind: string): ((id: string) => Promise<DeleteResult>) | undefined =>
  DELETERS[collectionKind as EntityKind];

export { recordDeleterFor };
export type { DeleteResult };
