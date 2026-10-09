/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { spriteDir } from './sprite-dir';

const readSetFile = (files: FileStore, romFile: string, name: string): Promise<Uint8Array | null> =>
  files.readBytes(`${spriteDir(romFile)}/${name}`);

export { readSetFile };
