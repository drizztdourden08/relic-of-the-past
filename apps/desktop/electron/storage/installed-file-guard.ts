/* @layer electron-main @kind logic */
import type { FileWriteGuard } from '@drizztdourden08/brock-electron/main';
import { refuseInstalledRemoval } from './installed-guard';

const installedFileGuard: FileWriteGuard = async ({ kind, path }) => {
  if (kind === 'trash') await refuseInstalledRemoval(path);
  return true;
};

export { installedFileGuard };
