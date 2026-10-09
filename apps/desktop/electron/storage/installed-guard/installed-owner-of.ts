/* @layer electron-main @kind logic */
import type { InstalledPack } from '@rotp/hub-contracts';
import { installedPacks } from '../../store/hookshop';
import { GUARDED_TOP } from './installed-guard.constants';
import { normalizeRel } from './normalize-rel';
import { rootOf } from './root-of';

const isInside = (path: string, root: string): boolean => path === root || path.startsWith(`${root}/`);

const installedOwnerOf = async (rel: string): Promise<InstalledPack | null> => {
  const path = normalizeRel(rel);
  if (!GUARDED_TOP.has(path.split('/')[0])) return null;
  for (const pack of await installedPacks()) {
    if (isInside(path, rootOf(pack))) return pack;
  }
  return null;
};

export { installedOwnerOf };
