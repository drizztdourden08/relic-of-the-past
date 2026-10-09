/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { packFile } from '../msu-paths';

const writeTrackFile = (files: FileStore, pack: string, fileName: string, bytes: Uint8Array): Promise<void> =>
  files.writeBytes(packFile(pack, fileName), bytes);

export { writeTrackFile };
