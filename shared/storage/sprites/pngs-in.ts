/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { spriteDir } from './sprite-dir';

const pngsIn = async (files: FileStore, romFile: string): Promise<Set<string>> =>
  new Set((await files.list(spriteDir(romFile))).filter((n) => n.endsWith('.png')));

export { pngsIn };
