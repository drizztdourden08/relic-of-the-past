/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packDir } from '../paths';
import { isMsuFile } from './is-msu-file';
import type { MsuPackFile } from './msu.type';

const getPackFiles = async (files: FileStore, pack: string): Promise<MsuPackFile[]> => {
  const out: MsuPackFile[] = [];
  for (const f of (await files.list(packDir(pack))).filter(isMsuFile)) {
    const st = await files.stat(`${packDir(pack)}/${f}`);
    if (st) out.push({ name: f, size: st.bytes });
  }
  return out;
};

export { getPackFiles };
