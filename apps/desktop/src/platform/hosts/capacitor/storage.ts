/* @layer renderer-other @kind logic */
import { Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import type { StoragePort, StorageSummary, DomainUsage, DataLocation } from '@shared/platform/ports/storage.type';
import { DIR, DOMAINS } from './capacitor.constants';

const dirBytes = async (dir: string): Promise<number> => {
  let total = 0;
  try {
    const { files } = await Filesystem.readdir({ path: dir, directory: DIR });
    for (const f of files) {
      if (f.type === 'directory') total += await dirBytes(`${dir}/${f.name}`);
      else total += f.size ?? 0;
    }
  } catch {
    return total;
  }
  return total;
};

const immediateCount = async (dir: string): Promise<number> => {
  try { return (await Filesystem.readdir({ path: dir, directory: DIR })).files.length; } catch { return 0; }
};

const readDataUri = async (): Promise<string> => {
  try { return (await Filesystem.getUri({ path: '', directory: DIR })).uri; } catch { return ''; }
};

const getLocation = async (): Promise<DataLocation> => ({
  path: await readDataUri(),
  osLabel: Capacitor.getPlatform() === 'ios' ? 'iOS (app storage)' : 'Android (app storage)',
  canReveal: false,
});

const createCapacitorStorage = (): StoragePort => ({
  getLocation,
  reveal: async () => {},
  revealProfile: async () => false,
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
