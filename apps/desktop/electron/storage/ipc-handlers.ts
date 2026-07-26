/* @layer electron-main @kind logic */
/**
 * Storage-info IPC: where data lives, revealing it in the OS file manager, and a
 * per-domain usage summary (immediate entry count + recursive byte size). Backs
 * the platform StoragePort on Electron.
 */
import { shell } from 'electron';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import type { DataDomain, DataLocation, DomainUsage, StorageSummary } from '@shared/platform';
import { getUserDataPath } from '../lib/paths';
import { handle } from '../lib/ipc/handle';

const OS_LABEL: Record<string, string> = {
  win32: 'Windows (AppData)',
  darwin: 'macOS (Application Support)',
  linux: 'Linux (~/.config)',
};

const DOMAINS: { domain: DataDomain; label: string; dir: string }[] = [
  { domain: 'profiles', label: 'Profiles', dir: 'profiles' },
  { domain: 'roms', label: 'ROMs', dir: 'roms' },
  { domain: 'sprites', label: 'Sprites', dir: 'sprites' },
  { domain: 'linkSprites', label: 'Link Sprites', dir: 'link-sprites' },
  { domain: 'languages', label: 'Languages', dir: 'languages' },
  { domain: 'msu', label: 'MSU packs', dir: 'msu' },
  { domain: 'assets', label: 'Assets', dir: 'assets' },
];

// Strips anything outside [A-Za-z0-9_-] so an id can never contain a path
// separator, '..', or a drive letter.
const sanitizeId = (id: string): string => id.replace(/[^A-Za-z0-9_-]/g, '_');

const dirBytes = async (dir: string): Promise<number> => {
  let total = 0;
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return 0; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) total += await dirBytes(full);
    else { try { total += (await stat(full)).size; } catch { /* skip unreadable */ } }
  }
  return total;
};

const immediateCount = async (dir: string): Promise<number> => {
  try { return (await readdir(dir)).length; } catch { return 0; }
};

const getLocation = (): DataLocation => ({
  path: getUserDataPath(),
  osLabel: OS_LABEL[process.platform] ?? process.platform,
  canReveal: true,
});

const registerStorageHandlers = (): void => {
  handle('storage:getLocation', () => getLocation());
  handle('storage:reveal', async () => { await shell.openPath(getUserDataPath()); });
  handle('storage:revealProfile', async (_e, profileId) => {
    const dir = getUserDataPath('profiles', sanitizeId(profileId));
    const error = await shell.openPath(dir);
    return error ? { success: false, error } : { success: true };
  });
  handle('storage:getSummary', async (): Promise<StorageSummary> => {
    const domains: DomainUsage[] = [];
    for (const { domain, label, dir } of DOMAINS) {
      const full = getUserDataPath(dir);
      domains.push({ domain, label, count: await immediateCount(full), bytes: await dirBytes(full) });
    }
    const totalBytes = domains.reduce((sum, d) => sum + d.bytes, 0);
    return { location: getLocation(), domains, totalBytes };
  });
};

export { registerStorageHandlers };
