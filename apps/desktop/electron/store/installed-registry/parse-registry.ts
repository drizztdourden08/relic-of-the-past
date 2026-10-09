/* @layer electron-main @kind logic */
import type { InstalledRegistry } from '@shared/store/installed-types';
import { isInstalledPack } from './is-installed-pack';

const parseRegistry = (text: string | null): InstalledRegistry => {
  if (!text) return { version: 1, packs: [] };
  try {
    const parsed = JSON.parse(text) as { version?: unknown; packs?: unknown };
    if (parsed.version !== 1 || !Array.isArray(parsed.packs)) return { version: 1, packs: [] };
    return { version: 1, packs: parsed.packs.filter(isInstalledPack) };
  } catch {
    return { version: 1, packs: [] };
  }
};

export { parseRegistry };
