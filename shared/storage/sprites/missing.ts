/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { spriteDir } from './sprite-dir';

const missing = async (files: FileStore, romFile: string, expected: readonly string[]): Promise<string[]> => {
  const present = new Set(await files.list(spriteDir(romFile)));
  return expected.filter((name) => !present.has(name));
};

export { missing };
