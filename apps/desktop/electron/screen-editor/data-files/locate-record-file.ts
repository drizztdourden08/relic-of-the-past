/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { collectKindFiles } from './collect-kind-files';

const locateRecordFile = async (
  root: string,
  roots: readonly string[],
  id: string,
): Promise<string | null> => {
  const needle = `id: '${id.replace(/'/g, "\\'")}'`;
  for (const file of await collectKindFiles(root, roots)) {
    const content = await readFile(file, 'utf-8');
    if (content.includes(needle)) return file;
  }
  return null;
};

export { locateRecordFile };
