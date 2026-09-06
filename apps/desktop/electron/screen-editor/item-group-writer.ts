/* @layer electron-main @kind logic */
/**
 * Creating, relabelling, or removing an item group.
 *
 * item-groups.ts writes `id` two ways: the symbolic `ITEM_GROUP_IDS.<Key>` form
 * every entry started with, or the plain literal a row gets once this path has
 * edited it. The matcher in source-writers.ts tries the literal first and falls
 * back to the symbolic form; only a write normalises a row, and only that row.
 *
 * `ITEM_GROUP_IDS` still names the seven groups that pre-date this path, but any
 * number of groups is a normal writable collection with allocator-minted ids.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { ITEM_GROUP_IDS } from '@shared/game/data';
import { serializeItemGroupRecord } from '@shared/game/data/record-codegen';
import type { ItemGroupRecord } from '@shared/game/data/types';
import type {
  Allocated, AllocateItemGroupArgs, AllocateItemGroupResult, DeleteItemGroupArgs, WriteItemGroupArgs, WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { withAllocatedIds } from './id-allocator';
import { insertBeforeArrayClose, removeById, replaceById } from './source-writers';

const ITEM_GROUPS_FILE = ['shared', 'game', 'data', 'records', 'item-groups', 'item-groups.ts'] as const;

/** Whether a group is already on file. Labels are the closest thing this collection has to a key. */
const alreadyPresent = (content: string, label: string): boolean =>
  content.includes(`label: '${label.replace(/'/g, "\\'")}',`);

const allocateItemGroup = async (root: string, args: AllocateItemGroupArgs): Promise<AllocateItemGroupResult> => {
  const label = args.label.trim();
  if (!label) return { success: false, error: 'An item group needs a label.' };

  const path = join(root, ...ITEM_GROUPS_FILE);
  const content = await readFile(path, 'utf-8');
  if (alreadyPresent(content, label)) return { success: false, error: `An item group named ${label} already exists.` };

  return withAllocatedIds(root, 'item-group', 1, async ([id]) => {
    const record: ItemGroupRecord = {
      id: id as ItemGroupRecord['id'],
      label,
      memberIds: [...args.memberIds],
    };
    const fresh = await readFile(path, 'utf-8');
    const result = insertBeforeArrayClose(fresh, serializeItemGroupRecord(record));
    if (result.error) return { success: false, error: result.error };
    await writeFile(path, result.content, 'utf-8');
    return { success: true, record: record as Allocated<ItemGroupRecord> };
  });
};

/** The symbolic needle a pristine entry may still be written as, or undefined for an unknown id. */
const symbolicNeedle = (id: string): string | undefined => {
  const key = Object.entries(ITEM_GROUP_IDS).find(([, value]) => value === id)?.[0];
  return key ? `id: ITEM_GROUP_IDS.${key}` : undefined;
};

const writeItemGroup = async (root: string, args: WriteItemGroupArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ITEM_GROUPS_FILE);
  const record: ItemGroupRecord = { id: args.groupId, ...args.record };
  const content = await readFile(path, 'utf-8');
  const result = replaceById(content, args.groupId, serializeItemGroupRecord(record), symbolicNeedle(args.groupId));
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.groupId] };
};

/** The delete-guard's actual delete step, once the caller has already confirmed it. */
const deleteItemGroup = async (root: string, args: DeleteItemGroupArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ITEM_GROUPS_FILE);
  const content = await readFile(path, 'utf-8');
  const result = removeById(content, args.groupId, symbolicNeedle(args.groupId));
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.groupId] };
};

export { allocateItemGroup, deleteItemGroup, writeItemGroup };
