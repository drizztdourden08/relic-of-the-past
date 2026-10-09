/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { spriteDir } from './sprite-dir';
import type { SpriteRemoval } from './sprites.type';

const remove = async (files: FileStore, romFile: string): Promise<SpriteRemoval> => {
  await files.remove(spriteDir(romFile));
  return { success: true };
};

export { remove };
