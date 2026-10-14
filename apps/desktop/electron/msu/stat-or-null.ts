/* @layer electron-main @kind logic */
import { join } from 'path';
import { stat } from 'fs/promises';
import type { Stats } from 'fs';

const statOrNull = async (dir: string, name: string): Promise<Stats | null> => {
  try {
    return await stat(join(dir, name));
  } catch {
    return null;
  }
};

export { statOrNull };
