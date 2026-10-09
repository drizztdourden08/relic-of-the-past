/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import type { WriteResult } from '../source-writers';

const editRecordFile = async (path: string, apply: (content: string) => WriteResult): Promise<string | null> => {
  const content = await readFile(path, 'utf-8');
  const result = apply(content);
  if (result.error) return result.error;
  await writeFile(path, result.content, 'utf-8');
  return null;
};

export { editRecordFile };
