/* @layer electron-main @kind logic */
import type { FileStore } from '@shared/platform';
import type { InstalledPack, InstalledRegistry } from '@shared/store/installed-types';
import { REGISTRY_PATH } from './installed-registry.constants';
import { parseRegistry } from './parse-registry';

const createInstalledRegistry = (files: FileStore) => {
  let queue: Promise<unknown> = Promise.resolve();

  const read = async (): Promise<InstalledRegistry> => parseRegistry(await files.readText(REGISTRY_PATH));

  const change = (edit: (packs: InstalledPack[]) => InstalledPack[]): Promise<void> => {
    const run = queue.then(async () => {
      const { packs } = await read();
      const next: InstalledRegistry = { version: 1, packs: edit(packs) };
      await files.writeText(REGISTRY_PATH, JSON.stringify(next, null, 2));
    });
    queue = run.catch(() => undefined);
    return run;
  };

  return {
    list: async (): Promise<InstalledPack[]> => (await read()).packs,
    get: async (itemId: string): Promise<InstalledPack | null> =>
      (await read()).packs.find((pack) => pack.itemId === itemId) ?? null,
    put: (pack: InstalledPack): Promise<void> =>
      change((packs) => [...packs.filter((p) => p.itemId !== pack.itemId), pack]),
    remove: (itemId: string): Promise<void> => change((packs) => packs.filter((p) => p.itemId !== itemId)),
  };
};

export { createInstalledRegistry };
