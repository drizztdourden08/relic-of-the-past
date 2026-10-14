/* @layer electron-main @kind logic */
import { join } from 'path';
import { readdir } from 'fs/promises';
import { isAudioFile } from '@rotp/msu';
import { statOrNull } from './stat-or-null';
import type { MsuPackSummary } from './ipc-handlers.type';

const packSummary = async (msuDir: string, name: string): Promise<MsuPackSummary> => {
  const packDir = join(msuDir, name);
  const msuFiles = (await readdir(packDir)).filter(isAudioFile);
  let totalSize = 0;
  for (const f of msuFiles) totalSize += (await statOrNull(packDir, f))?.size ?? 0;
  return { name, fileCount: msuFiles.length, totalSize };
};

export { packSummary };
