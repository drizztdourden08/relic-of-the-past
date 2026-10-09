/* @layer electron-main @kind logic */
import { safeStorage } from 'electron';
import { readFile } from 'fs/promises';
import { canStore } from './can-store';
import { tokenPath } from './token-path';

const readToken = async (): Promise<string | null> => {
  try {
    const bytes = await readFile(tokenPath());
    return canStore() ? safeStorage.decryptString(bytes) : null;
  } catch {
    return null;
  }
};

export { readToken };
