/* @layer shared-store @kind logic */
/**
 * Music packs: the Data Manager's own `.msul` install, into a new folder under `msu/` named
 * after the store listing. Uninstall removes that folder. After an update removed the version
 * before it, the new folder moves back to the listing's name, so updates never pile up
 * "(2)" suffixes.
 */
import type { FileStore } from '@shared/platform';
import { deletePack, renamePack } from '@shared/storage/msu';
import { assertSafeName, packDir } from '@shared/storage/msu-paths';
import { installMsulPack, sanitizePackName } from '@shared/storage/msul/install-msul-pack';
import type { InstallProgress, PackInstaller } from './installer.type';

const install = async (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void, name?: string) => {
  const { pack } = await installMsulPack(files, bytes, {
    desiredName: name,
    onProgress: (done, total) => onProgress({ phase: 'unpack', done, total }),
  });
  return { installedName: pack };
};

const uninstall = async (installedName: string, files: FileStore): Promise<void> => {
  assertSafeName(installedName);
  await deletePack(files, installedName);
};

const settleName = async (installedName: string, listingName: string, files: FileStore): Promise<string> => {
  const wanted = sanitizePackName(listingName);
  if (!wanted || wanted === installedName || await files.exists(packDir(wanted))) return installedName;
  await renamePack(files, installedName, wanted);
  return wanted;
};

const msulInstaller: PackInstaller = { container: 'msul', install, uninstall, settleName };

export { msulInstaller };
