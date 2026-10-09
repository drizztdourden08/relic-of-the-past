/* @layer electron-main @kind logic */
import { safeStorage } from 'electron';
import { writeFile } from 'fs/promises';
import { canStore } from './can-store';
import { tokenPath } from './token-path';

const saveToken = async (token: string): Promise<void> => {
  if (!canStore()) throw new Error('This system cannot keep the sign-in encrypted, so it was not stored.');
  await writeFile(tokenPath(), safeStorage.encryptString(token));
};

export { saveToken };
