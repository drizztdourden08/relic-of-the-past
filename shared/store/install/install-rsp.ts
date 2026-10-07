/* @layer shared-store @kind logic */
/**
 * Character sprites: one `.rsp` file in the sprite library, under a name no other file has, so
 * a store install never replaces a sprite the player made. Uninstall removes that one file.
 */
import type { FileStore } from '@shared/platform';
import { parseRsp, isRspName } from '@shared/storage/link-sprites/parse-rsp';
import {
  deleteLinkSprite, freeSpriteName, readLinkSprite, safeFileName, writeLinkSprite,
} from '@shared/storage/link-sprites/link-sprites';
import type { InstallProgress, PackInstaller } from './installer.type';

const install = async (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void) => {
  const sheet = await parseRsp(bytes);
  if (!sheet) throw new Error('This download is not a readable sprite pack.');
  const ownName = safeFileName(`${sheet.meta.name || 'sprite'}.rsp`);
  const name = await freeSpriteName(files, ownName);
  onProgress({ phase: 'unpack', done: 0, total: 1 });
  await writeLinkSprite(files, name, bytes);
  onProgress({ phase: 'unpack', done: 1, total: 1 });
  return { installedName: name, ownName };
};

const uninstall = async (installedName: string, files: FileStore): Promise<void> => {
  if (!isRspName(installedName) || safeFileName(installedName) !== installedName) {
    throw new Error(`Not an installed sprite pack: ${installedName}`);
  }
  await deleteLinkSprite(files, installedName);
};

/** Moves the file to the sprite's own name once that name is free (after an update). */
const settleName = async (installedName: string, ownName: string, files: FileStore): Promise<string> => {
  if (ownName === installedName || await readLinkSprite(files, ownName)) return installedName;
  const bytes = await readLinkSprite(files, installedName);
  if (!bytes) return installedName;
  await writeLinkSprite(files, ownName, bytes);
  await deleteLinkSprite(files, installedName);
  return ownName;
};

const rspInstaller: PackInstaller = { container: 'rsp', install, uninstall, settleName };

export { rspInstaller };
