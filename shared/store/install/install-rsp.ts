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

const install = async (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void, listingName?: string) => {
  const sheet = await parseRsp(bytes);
  if (!sheet) throw new Error('This download is not a readable sprite pack.');
  const name = await freeSpriteName(files, `${listingName || sheet.meta.name || 'sprite'}.rsp`);
  onProgress({ phase: 'unpack', done: 0, total: 1 });
  await writeLinkSprite(files, name, bytes);
  onProgress({ phase: 'unpack', done: 1, total: 1 });
  return { installedName: name };
};

const uninstall = async (installedName: string, files: FileStore): Promise<void> => {
  if (!isRspName(installedName) || safeFileName(installedName) !== installedName) {
    throw new Error(`Not an installed sprite pack: ${installedName}`);
  }
  await deleteLinkSprite(files, installedName);
};

/** Moves the file to the listing's name once that name is free (after an update). */
const settleName = async (installedName: string, listingName: string, files: FileStore): Promise<string> => {
  const wanted = await freeSpriteName(files, `${listingName}.rsp`);
  if (wanted === installedName || wanted !== safeFileName(`${listingName}.rsp`)) return installedName;
  const bytes = await readLinkSprite(files, installedName);
  if (!bytes) return installedName;
  await writeLinkSprite(files, wanted, bytes);
  await deleteLinkSprite(files, installedName);
  return wanted;
};

const rspInstaller: PackInstaller = { container: 'rsp', install, uninstall, settleName };

export { rspInstaller };
