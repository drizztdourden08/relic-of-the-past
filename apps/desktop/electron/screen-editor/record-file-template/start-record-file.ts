/* @layer electron-main @kind logic */
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { emptyRecordFile } from './empty-record-file';

const startRecordFile = async (
  path: string,
  relativePath: string,
  recordType: string,
): Promise<string | null> => {
  try {
    await readFile(path, 'utf-8');
    return null;
  } catch {
    const contents = emptyRecordFile(relativePath, recordType);
    if (!contents) return `No file could be started for ${relativePath}`;
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents, 'utf-8');
    return null;
  }
};

export { startRecordFile };
