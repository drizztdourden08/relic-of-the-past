/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { app } from 'electron';
import StreamZip from 'node-stream-zip';
import type { ExtractProgress } from './archive.type';

const countEntries = async (zip: InstanceType<typeof StreamZip.async>): Promise<number | undefined> => {
  try {
    return await zip.entriesCount;
  } catch {
    return undefined;
  }
};

const extractArchiveToTempDir = async (archivePath: string, onProgress?: ExtractProgress): Promise<string> => {
  const tempDir = join(app.getPath('temp'), `archive-extract-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });
  const zip = new StreamZip.async({ file: archivePath });
  try {
    if (onProgress) {
      const total = await countEntries(zip);
      let extracted = 0;
      zip.on('extract', () => { extracted += 1; onProgress(extracted, total); });
    }
    await zip.extract(null, tempDir);
  } finally {
    await zip.close();
  }
  return tempDir;
};

export { extractArchiveToTempDir };
