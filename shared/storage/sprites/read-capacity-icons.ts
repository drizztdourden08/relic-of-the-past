/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { CAPACITY_ICONS_FILE } from '@shared/asset-extraction/item-sprites/capacity-icons';
import { readSetFile } from './read-set-file';

const readCapacityIcons = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  readSetFile(files, romFile, CAPACITY_ICONS_FILE);

export { readCapacityIcons };
