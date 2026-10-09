/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { isAudioFile, packDir } from '../msu-paths';
import type { MsuPackFile } from './msu.type';

const listAudioFiles = async (files: FileStore, pack: string): Promise<MsuPackFile[]> => {
  const out: MsuPackFile[] = [];
  for (const f of (await files.list(packDir(pack))).filter(isAudioFile)) {
    const st = await files.stat(`${packDir(pack)}/${f}`);
    if (st && !st.isDirectory) out.push({ name: f, size: st.bytes });
  }
  return out;
};

export { listAudioFiles };
