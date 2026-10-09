/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { DeleteItemGroupArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { removeById } from '../source-writers';
import { ITEM_GROUPS_FILE } from './item-group-writer.constants';
import { symbolicNeedle } from './symbolic-needle';

const deleteItemGroup = async (root: string, args: DeleteItemGroupArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ITEM_GROUPS_FILE);
  const content = await readFile(path, 'utf-8');
  const result = removeById(content, args.groupId, symbolicNeedle(args.groupId));
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.groupId] };
};

export { deleteItemGroup };
