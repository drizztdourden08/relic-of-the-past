/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packFile } from '../paths';
import type { MsuTrackUpload } from './msu.type';

const installTracks = async (files: FileStore, pack: string, tracks: MsuTrackUpload[]): Promise<void> => {
  for (const t of tracks) await files.writeBytes(packFile(pack, t.name), t.bytes);
};

export { installTracks };
