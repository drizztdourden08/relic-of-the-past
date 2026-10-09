/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packDir } from '../msu-paths';
import { isMsuFile } from './is-msu-file';
import type { MsuPackSummary } from './msu.type';

const listPacks = async (files: FileStore): Promise<MsuPackSummary[]> => {
  const out: MsuPackSummary[] = [];
  for (const name of await files.list('msu')) {
    const trackFiles = (await files.list(packDir(name))).filter(isMsuFile);
    let totalSize = 0;
    for (const f of trackFiles) { const st = await files.stat(`${packDir(name)}/${f}`); if (st) totalSize += st.bytes; }
    out.push({ name, fileCount: trackFiles.length, totalSize });
  }
  return out;
};

export { listPacks };
