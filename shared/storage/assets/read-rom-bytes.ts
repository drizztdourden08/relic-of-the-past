/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';

const readRomBytes = (files: FileStore, romFile: string): Promise<Uint8Array | null> => files.readBytes(`roms/${romFile}`);

export { readRomBytes };
