/* @layer shared-store @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { deletePack, renamePack } from '../../packs';
import { assertSafeName, packDir } from '../../paths';
import { installMsulPack } from '../../msul/install-msul-pack';
import type { InstallProgress, PackInstaller } from '@rotp/hub-contracts';

const install = async (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void) => {
  const { pack, ownName } = await installMsulPack(files, bytes, {
    onProgress: (done, total) => onProgress({ phase: 'unpack', done, total }),
  });
  return { installedName: pack, ownName };
};

const uninstall = async (installedName: string, files: FileStore): Promise<void> => {
  assertSafeName(installedName);
  await deletePack(files, installedName);
};

const settleName = async (installedName: string, ownName: string, files: FileStore): Promise<string> => {
  if (ownName === installedName || await files.exists(packDir(ownName))) return installedName;
  await renamePack(files, installedName, ownName);
  return ownName;
};

const msulInstaller: PackInstaller = { container: 'msul', install, uninstall, settleName };

export { msulInstaller };
