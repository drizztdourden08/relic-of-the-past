/* @layer electron-main @kind logic */
import { access } from 'fs/promises';
import { constants } from 'fs';

const isExecutable = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

export { isExecutable };
