/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import type { WriteRecordResult } from '@app/ipc/screen-editor-contract';
import type { WriteResult } from './source-writers';

const editSourceFile = async (
  path: string,
  edit: (content: string) => WriteResult,
  ids: readonly string[],
): Promise<WriteRecordResult> => {
  const content = await readFile(path, 'utf-8');
  const result = edit(content);
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids };
};

export { editSourceFile };
