/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { packFile } from '../msu-paths';

const readTrackFile = (files: FileStore, pack: string, fileName: string): Promise<Uint8Array | null> =>
  files.readBytes(packFile(pack, fileName));

export { readTrackFile };
