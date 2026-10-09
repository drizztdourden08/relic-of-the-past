/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { DeleteTagArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { removeById } from '../source-writers';
import { TAGS_FILE } from './tag-writer.constants';

const deleteTag = async (root: string, args: DeleteTagArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...TAGS_FILE);
  const content = await readFile(path, 'utf-8');
  const result = removeById(content, args.tagId);
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.tagId] };
};

export { deleteTag };
