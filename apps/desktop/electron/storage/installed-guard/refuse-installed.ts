/* @layer electron-main @kind logic */
import { installedOwnerOf } from './installed-owner-of';
import { lockedError } from './locked-error';

const refuseInstalled = async (rel: string): Promise<void> => {
  const owner = await installedOwnerOf(rel);
  if (owner) throw lockedError(owner);
};

export { refuseInstalled };
