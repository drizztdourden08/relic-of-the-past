/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import { tokenPath } from './token-path';

const clearToken = async (): Promise<void> => {
  await rm(tokenPath(), { force: true });
};

export { clearToken };
