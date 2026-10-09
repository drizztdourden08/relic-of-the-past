/* @layer shared-store @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { importRlang } from '@shared/storage/languages/import-rlang';
import { assertValidSetId } from '@shared/storage/languages/set-id';
import { remove } from '@shared/storage/languages/write';
import type { InstallProgress, PackInstaller } from './installer.type';

const install = async (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void) => {
  const { id } = await importRlang(files, bytes, {
    onProgress: (done, total) => onProgress({ phase: 'unpack', done, total }),
  });
  return { installedName: id };
};

const uninstall = async (installedName: string, files: FileStore): Promise<void> => {
  assertValidSetId(installedName);
  await remove(files, installedName);
};

const rlangInstaller: PackInstaller = { container: 'rlang', install, uninstall };

export { rlangInstaller };
