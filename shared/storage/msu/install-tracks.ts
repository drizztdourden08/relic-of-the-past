/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { packFile } from '../msu-paths';
import type { MsuTrackUpload } from './msu.type';

const installTracks = async (files: FileStore, pack: string, tracks: MsuTrackUpload[]): Promise<void> => {
  for (const t of tracks) await files.writeBytes(packFile(pack, t.name), t.bytes);
};

export { installTracks };
