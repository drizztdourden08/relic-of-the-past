/* @layer electron-main @kind logic */
import { stat } from 'fs/promises';

const pathExists = async (path: string): Promise<boolean> => {
  try { await stat(path); return true; } catch { return false; }
};

export { pathExists };
