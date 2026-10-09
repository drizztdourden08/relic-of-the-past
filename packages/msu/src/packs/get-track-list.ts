/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packDir, trackNumberOf } from '../paths';
import { extensionOf } from './extension-of';
import type { MsuTrackFile } from './msu.type';

const getTrackList = async (files: FileStore, pack: string): Promise<MsuTrackFile[]> => {
  const out: MsuTrackFile[] = [];
  for (const f of await files.list(packDir(pack))) {
    const trackNum = trackNumberOf(f);
    if (trackNum !== null) out.push({ fileName: f, trackNum, ext: extensionOf(f) });
  }
  return out;
};

export { getTrackList };
