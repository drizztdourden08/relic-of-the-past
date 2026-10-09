/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packFile } from '../msu-paths';

const deleteTrackFile = (files: FileStore, pack: string, fileName: string): Promise<void> =>
  files.remove(packFile(pack, fileName));

export { deleteTrackFile };
