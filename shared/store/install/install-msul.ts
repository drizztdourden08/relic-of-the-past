/* @layer shared-store @kind logic */
/**
 * Music packs: the Data Manager's own `.msul` install, into a new folder under `msu/`.
 * Uninstall removes that folder.
 */
import type { FileStore } from '@shared/platform';
import { deletePack } from '@shared/storage/msu';
import { assertSafeName } from '@shared/storage/msu-paths';
import { installMsulPack } from '@shared/storage/msul/install-msul-pack';
import type { InstallProgress, PackInstaller } from './installer.type';

const install = async (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void) => {
  const { pack } = await installMsulPack(files, bytes, {
    onProgress: (done, total) => onProgress({ phase: 'unpack', done, total }),
  });
  return { installedName: pack };
};

const uninstall = async (installedName: string, files: FileStore): Promise<void> => {
  assertSafeName(installedName);
  await deletePack(files, installedName);
};

const msulInstaller: PackInstaller = { container: 'msul', install, uninstall };

export { msulInstaller };
