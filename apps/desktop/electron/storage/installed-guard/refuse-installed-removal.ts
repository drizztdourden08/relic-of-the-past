/* @layer electron-main @kind logic */
import { installedBelow } from './installed-below';
import { lockedError } from './locked-error';
import { refuseInstalled } from './refuse-installed';

const refuseInstalledRemoval = async (rel: string): Promise<void> => {
  await refuseInstalled(rel);
  const below = await installedBelow(rel);
  if (below) throw lockedError(below);
};

export { refuseInstalledRemoval };
