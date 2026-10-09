/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import { getUserDataPath } from '../../lib/paths';

const deleteProfile = (id: string): Promise<void> =>
  rm(getUserDataPath('profiles', id), { recursive: true, force: true });

export { deleteProfile };
