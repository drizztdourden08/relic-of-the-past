/* @layer renderer-other @kind logic */
/**
 * Capacitor StoragePort — app-private location + per-domain usage via the
 * Filesystem plugin. No "reveal" on mobile (revealDataFolder is false); the home
 * page shows the path read-only.
 */
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import type { StoragePort, StorageSummary, DomainUsage, DataDomain, DataLocation } from '@shared/platform';

const DIR = Directory.Data;

const DOMAINS: { domain: DataDomain; label: string; dir: string }[] = [
  { domain: 'profiles', label: 'Profiles', dir: 'profiles' },
  { domain: 'roms', label: 'ROMs', dir: 'roms' },
  { domain: 'sprites', label: 'Sprites', dir: 'sprites' },
  { domain: 'linkSprites', label: 'Link Sprites', dir: 'link-sprites' },
  { domain: 'languages', label: 'Languages', dir: 'languages' },
  { domain: 'msu', label: 'MSU packs', dir: 'msu' },
  { domain: 'assets', label: 'Assets', dir: 'assets' },
];

const dirBytes = async (dir: string): Promise<number> => {
  let total = 0;
  try {
    const { files } = await Filesystem.readdir({ path: dir, directory: DIR });
    for (const f of files) {
      if (f.type === 'directory') total += await dirBytes(`${dir}/${f.name}`);
      else total += f.size ?? 0;
    }
  } catch { /* missing dir → 0 */ }
  return total;
};

const immediateCount = async (dir: string): Promise<number> => {
  try { return (await Filesystem.readdir({ path: dir, directory: DIR })).files.length; } catch { return 0; }
};

const getLocation = async (): Promise<DataLocation> => {
  let path = '';
  try { path = (await Filesystem.getUri({ path: '', directory: DIR })).uri; } catch { /* ignore */ }
  return {
    path,
    osLabel: Capacitor.getPlatform() === 'ios' ? 'iOS (app storage)' : 'Android (app storage)',
    canReveal: false,
  };
};

const createCapacitorStorage = (): StoragePort => ({
  getLocation,
  reveal: async () => {},
  spritesBaseUrl: async (romFile) => {
    const stem = romFile.replace(/\.(sfc|smc)$/i, '');
    try {
      const { uri } = await Filesystem.getUri({ path: `sprites/${stem}`, directory: DIR });
      return `${Capacitor.convertFileSrc(uri)}/`;
    } catch { return ''; }
  },
  getSummary: async (): Promise<StorageSummary> => {
    const domains: DomainUsage[] = [];
    for (const { domain, label, dir } of DOMAINS) {
      domains.push({ domain, label, count: await immediateCount(dir), bytes: await dirBytes(dir) });
    }
    return { location: await getLocation(), domains, totalBytes: domains.reduce((s, d) => s + d.bytes, 0) };
  },
});

export { createCapacitorStorage };
