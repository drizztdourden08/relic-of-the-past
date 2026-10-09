/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { GEAR_ICONS_FILE } from '@shared/asset-extraction/item-sprites/gear-icons';
import { readSetFile } from './read-set-file';

const readGearIcons = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  readSetFile(files, romFile, GEAR_ICONS_FILE);

export { readGearIcons };
