/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeItemGroupRecord } from '@shared/game/data/record-codegen';
import type { ItemGroupRecord } from '@shared/game/data/types';
import type { Allocated, AllocateItemGroupArgs, AllocateItemGroupResult } from '@shared/ipc/screen-editor-contract';
import { withAllocatedIds } from '../id-allocator';
import { insertBeforeArrayClose } from '../source-writers';
import { ITEM_GROUPS_FILE } from './item-group-writer.constants';

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

export { allocateItemGroup };
