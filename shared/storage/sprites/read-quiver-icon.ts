/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { QUIVER_ICON_FILE } from '@shared/asset-extraction/item-sprites/quiver-icon';
import { readSetFile } from './read-set-file';

const readQuiverIcon = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  readSetFile(files, romFile, QUIVER_ICON_FILE);

export { readQuiverIcon };
