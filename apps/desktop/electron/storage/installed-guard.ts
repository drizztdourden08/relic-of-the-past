/* @layer electron-main @kind logic */
/**
 * The lock on what the Hookshop installed. An installed music pack, language set or sprite file
 * stays as its author published it, so every write a renderer can ask for (the file store IPC,
 * the music pack and language channels) asks here first and is refused inside one. The store's
 * own install, update and uninstall write through their in-process file store and never pass
 * through here, which makes them the only writers.
 */
import { posix } from 'path';
import type { InstalledPack } from '@shared/store/installed-types';
import type { StoreKind } from '@shared/store/types';
import { installedRegistry } from '../store/store-files';

/** The Data path an installed item occupies, by kind. */
const INSTALLED_ROOTS: Record<StoreKind, (name: string) => string> = {
  music: (name) => `msu/${name}`,
  language: (name) => `languages/${name}`,
  character: (name) => `link-sprites/${name}`,
};

/** Only paths under these folders can hold an installed item, so others skip the registry read. */
const GUARDED_TOP = new Set(['msu', 'languages', 'link-sprites']);

/** Windows and macOS folders ignore case, so a differently cased path is the same item there. */
const foldCase = (path: string): string => (process.platform === 'linux' ? path : path.toLowerCase());

/** POSIX, relative, no leading `/` or `./`, no trailing slash: the one spelling roots are compared in. */
const normalizeRel = (rel: string): string => {
  const path = posix.normalize(rel.replace(/\\/g, '/')).replace(/^(\.?\/)+/, '').replace(/\/+$/, '');
  return foldCase(path === '.' ? '' : path);
};

const rootOf = (pack: InstalledPack): string => foldCase(INSTALLED_ROOTS[pack.kind](pack.installedName));

const isInside = (path: string, root: string): boolean => path === root || path.startsWith(`${root}/`);

/** The installed item a relative Data path falls inside, or null. */
const installedOwnerOf = async (rel: string): Promise<InstalledPack | null> => {
  const path = normalizeRel(rel);
  if (!GUARDED_TOP.has(path.split('/')[0])) return null;
  for (const pack of await installedRegistry.list()) {
    if (isInside(path, rootOf(pack))) return pack;
  }
  return null;
};

/** An installed item inside the folder a removal would take away with it, or null. */
const installedBelow = async (rel: string): Promise<InstalledPack | null> => {
  const path = normalizeRel(rel);
  if (path !== '' && !GUARDED_TOP.has(path)) return null;
  const packs = await installedRegistry.list();
  return packs.find((pack) => path === '' || rootOf(pack).startsWith(`${path}/`)) ?? null;
};

const lockedError = (pack: InstalledPack): Error =>
  new Error(`"${pack.origin.name}" is installed from the Hookshop and read only. Duplicate it to change it.`);

/** Throws when the path is inside an installed item. */
const refuseInstalled = async (rel: string): Promise<void> => {
  const owner = await installedOwnerOf(rel);
  if (owner) throw lockedError(owner);
};

/** refuseInstalled, and also refuses removing a folder that holds an installed item. */
const refuseInstalledRemoval = async (rel: string): Promise<void> => {
  await refuseInstalled(rel);
  const below = await installedBelow(rel);
  if (below) throw lockedError(below);
};

export { installedOwnerOf, refuseInstalled, refuseInstalledRemoval };
