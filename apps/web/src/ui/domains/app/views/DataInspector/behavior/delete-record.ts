/* @layer renderer-app @kind logic */
/**
 * Deleting a record.
 *
 * Every kind the reference index answers for is wired, because a delete path
 * without a reverse index would be a delete with nothing to warn about. Each
 * deleter mirrors `create-tag.ts`'s own shape — the main process writes the
 * source file first, and only on success is the in-memory session folded back
 * into step, so a failed write never desyncs the registry from disk.
 *
 * Tag and item group each keep lookup maps of their own beside the registry, so
 * each has its own unregister; the six record-facade collections keep nothing
 * else, so one factory covers them with the generic `unregisterRecord`.
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

/** One delete for a record-facade collection — only the channel differs. */
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
