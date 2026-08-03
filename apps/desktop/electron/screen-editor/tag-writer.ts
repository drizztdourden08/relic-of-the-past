/* @layer electron-main @kind logic */
/**
 * Appends a new vocabulary term to the tag dataset file.
 *
 * The caller supplies a key and the collections it belongs on. Everything else
 * is derived here: the two levels come from the key, the id comes from the
 * allocator, and the record text comes from the dataset's own emitter — so
 * neither a key-derived id nor a stale record shape can reach disk.
 *
 * The `namespace:value` shape is REQUIRED rather than advised. It is the
 * hierarchy the whole collection is organised by, and a term with no namespace
 * would be a record that cannot be filed, browsed or grouped. The renderer
 * refuses one too; this is the check that actually holds, because it is the one
 * standing between a bad key and the file.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeTagRecord } from '@shared/game/data/record-codegen';
import { splitTagKey } from '@shared/game/data/tags/lookup';
import type { TagRecord } from '@shared/game/data/types';
import type {
  Allocated, AllocateTagArgs, AllocateTagResult, DeleteTagArgs, WriteRecordResult, WriteTagArgs,
} from '@shared/ipc/screen-editor-contract';
import { withAllocatedIds } from './id-allocator';
import { insertBeforeArrayClose, removeById, replaceById } from './source-writers';

const TAGS_FILE = ['shared', 'game', 'data', 'tags', 'tags.ts'] as const;

const CONVENTION = 'A tag reads namespace:value — both parts are required.';
const NO_SCOPE = 'A tag has to apply to at least one collection.';

/** A term already on file. Matched on the key, which is what a duplicate IS. */
const alreadyPresent = (content: string, key: string): boolean =>
  content.includes(`name: '${key.replace(/'/g, "\\'")}',`);

const allocateTag = async (root: string, args: AllocateTagArgs): Promise<AllocateTagResult> => {
  const key = args.key.trim();
  const parts = splitTagKey(key);
  if (!parts) return { success: false, error: CONVENTION };
  if (args.appliesTo.length === 0) return { success: false, error: NO_SCOPE };

  const path = join(root, ...TAGS_FILE);
  const content = await readFile(path, 'utf-8');
  if (alreadyPresent(content, key)) return { success: false, error: `The tag ${key} already exists.` };

  return withAllocatedIds(root, 'tag', 1, async ([id]) => {
    const record: TagRecord = {
      id: id as TagRecord['id'],
      name: key,
      namespace: parts.namespace,
      value: parts.value,
      label: args.label?.trim() || parts.value,
      namespaceLabel: args.namespaceLabel?.trim() || parts.namespace,
      appliesTo: [...args.appliesTo],
    };
    const fresh = await readFile(path, 'utf-8');
    const result = insertBeforeArrayClose(fresh, serializeTagRecord(record));
    if (result.error) return { success: false, error: result.error };
    await writeFile(path, result.content, 'utf-8');
    return { success: true, record: record as Allocated<TagRecord> };
  });
};

/**
 * Relabels a term already on file — the delete-guard feature's other half of
 * write access, alongside minting a brand-new one above. Always a replace: the
 * renderer already has the record open, so there is no id left to allocate.
 */
const writeTag = async (root: string, args: WriteTagArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...TAGS_FILE);
  const record: TagRecord = { id: args.tagId, ...args.record };
  const content = await readFile(path, 'utf-8');
  const result = replaceById(content, args.tagId, serializeTagRecord(record));
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.tagId] };
};

/** The delete-guard's actual delete step, once the caller has already confirmed it. */
const deleteTag = async (root: string, args: DeleteTagArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...TAGS_FILE);
  const content = await readFile(path, 'utf-8');
  const result = removeById(content, args.tagId);
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.tagId] };
};

export { allocateTag, deleteTag, writeTag };
