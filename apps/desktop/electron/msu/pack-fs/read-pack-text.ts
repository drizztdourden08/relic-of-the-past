/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';

const readPackText = async (path: string): Promise<string | null> => {
  try { return await readFile(path, 'utf-8'); } catch { return null; }
};

export { readPackText };
