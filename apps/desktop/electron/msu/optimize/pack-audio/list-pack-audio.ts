/* @layer electron-main @kind logic */
import { join } from 'path';
import { readdir, stat } from 'fs/promises';
import { isAudioFile } from '@shared/storage/msu-paths';
import { packPath } from '../../pack-fs';
import type { PackAudioFile } from './pack-audio.type';

const listPackAudio = async (pack: string): Promise<PackAudioFile[]> => {
  const dir = packPath(pack);
  const out: PackAudioFile[] = [];
  for (const name of (await readdir(dir)).filter(isAudioFile)) {
    try {
      const entry = await stat(join(dir, name));
      if (entry.isFile()) out.push({ name, sizeBytes: entry.size });
    } catch {
      continue;
    }
  }
  return out;
};

export { listPackAudio };
