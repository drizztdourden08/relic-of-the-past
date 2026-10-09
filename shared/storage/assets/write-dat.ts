/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { basePath } from './base-path';

const writeDat = (files: FileStore, romFile: string, dat: Uint8Array): Promise<void> =>
  files.writeBytes(basePath(romFile), dat);

export { writeDat };
