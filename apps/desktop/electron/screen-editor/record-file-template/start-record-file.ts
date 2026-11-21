/* @layer electron-main @kind logic */
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
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
    if (!contents) return mainText(msg('screen-editor:file.noStart', { path: relativePath }));
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents, 'utf-8');
    return null;
  }
};

export { startRecordFile };
