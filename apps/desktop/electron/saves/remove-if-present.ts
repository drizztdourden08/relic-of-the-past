/* @layer electron-main @kind logic */
import { unlink } from 'fs/promises';

const removeIfPresent = async (path: string): Promise<void> => {
  try {
    await unlink(path);
  } catch {
    return;
  }
};

export { removeIfPresent };
