/* @layer electron-main @kind logic */
/**
 * What the Hookshop installed: `store/installed.json` under the Data root, one record per item.
 * It runs on the FileStore port, so a test can drive it on a store in memory. Every change is a
 * read-modify-write in one queue, so two installs finishing together never drop each other's
 * record. A file that does not parse reads as empty, and a record missing a field is skipped,
 * so a damaged file never blocks the tab. A record without a well-formed origin is not valid
 * and is skipped the same way.
 */
import type { FileStore } from '@shared/platform';
import { isContainer } from '@shared/store/containers';
import type { InstalledOrigin, InstalledPack, InstalledRegistry } from '@shared/store/installed-types';

const REGISTRY_PATH = 'store/installed.json';
const KINDS = ['music', 'character', 'language'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isNonEmpty = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

/** The listing name, the author as a Person, and a licence id, none of them empty. */
const isInstalledOrigin = (value: unknown): value is InstalledOrigin => {
  if (!isRecord(value) || !isRecord(value.author)) return false;
  return isNonEmpty(value.name) && isNonEmpty(value.license)
    && isNonEmpty(value.author.userId) && typeof value.author.displayName === 'string';
};

const isInstalledPack = (value: unknown): value is InstalledPack => {
  if (!isRecord(value)) return false;
  const pack = value;
  return typeof pack.itemId === 'string'
    && KINDS.includes(pack.kind as string)
    && typeof pack.version === 'number'
    && typeof pack.semver === 'string'
    && isContainer(pack.container)
    && typeof pack.installedName === 'string'
    && pack.installedName.length > 0
    && typeof pack.installedAt === 'number'
    && isInstalledOrigin(pack.origin);
};

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
    /** Adds the record, or replaces the one for the same item (an update). */
    put: (pack: InstalledPack): Promise<void> =>
      change((packs) => [...packs.filter((p) => p.itemId !== pack.itemId), pack]),
    remove: (itemId: string): Promise<void> => change((packs) => packs.filter((p) => p.itemId !== itemId)),
  };
};

type InstalledRegistryStore = ReturnType<typeof createInstalledRegistry>;

export { createInstalledRegistry, isInstalledOrigin, parseRegistry, REGISTRY_PATH };
export type { InstalledRegistryStore };
