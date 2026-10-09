/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { DeleteEnumerationArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { removeById } from '../source-writers';
import { ENUMERATION_FILE } from './enumeration-writer.constants';
import { regenerateTypes } from './regenerate-types';

const deleteEnumeration = async (root: string, args: DeleteEnumerationArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ENUMERATION_FILE);
  const content = await readFile(path, 'utf-8');
  const result = removeById(content, args.enumerationId);
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  await regenerateTypes(root);
  return { success: true, ids: [args.enumerationId] };
};

export { deleteEnumeration };
