/* @layer electron-main @kind logic */
import type { InstalledPack } from '@shared/store/installed-types';
import { installedRegistry } from '../../store/store-files';
import { GUARDED_TOP } from './installed-guard.constants';
import { normalizeRel } from './normalize-rel';
import { rootOf } from './root-of';

const installedBelow = async (rel: string): Promise<InstalledPack | null> => {
  const path = normalizeRel(rel);
  if (path !== '' && !GUARDED_TOP.has(path)) return null;
  const packs = await installedRegistry.list();
  return packs.find((pack) => path === '' || rootOf(pack).startsWith(`${path}/`)) ?? null;
};

export { installedBelow };
