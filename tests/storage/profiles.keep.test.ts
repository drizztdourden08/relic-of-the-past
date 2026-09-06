/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import type { FileStore } from '@shared/platform';
import {
  getAppState, listProfiles, loadProfile, createProfile, updateProfile,
  deleteProfile, setLastProfile, readConfig, writeConfig,
} from '@shared/storage/profiles';

// In-memory FileStore mirroring the contract (text-only is enough for this domain).
const memFiles = (): FileStore => {
  const store = new Map<string, string>();
  return {
    readBytes: async () => null,
    readText: async (p) => store.get(p) ?? null,
    writeBytes: async () => {},
    writeText: async (p, d) => { store.set(p, d); },
    list: async (dir) => {
      const prefix = `${dir}/`;
      const names = new Set<string>();
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) names.add(key.slice(prefix.length).split('/')[0]);
      }
      return [...names];
    },
    remove: async (p) => {
      for (const key of [...store.keys()]) {
        if (key === p || key.startsWith(`${p}/`)) store.delete(key);
      }
    },
    exists: async (p) => store.has(p) || [...store.keys()].some((k) => k.startsWith(`${p}/`)),
    mkdir: async () => {},
    stat: async (p) => (store.has(p) ? { bytes: store.get(p)!.length, isDirectory: false } : null),
  };
};

describe('shared profile store (over FileStore)', () => {
  it('creates, lists, loads and patches profiles', async () => {
    const files = memFiles();
    const a = await createProfile(files, { name: 'Alpha', romFile: 'alttp.sfc', language: 'us' });
    const b = await createProfile(files, { name: 'Beta', romFile: 'alttp.sfc' });

    const list = await listProfiles(files);
    expect(list).toHaveLength(2);
    expect(list.map((p) => p.id).sort()).toEqual([a.id, b.id].sort());

    expect((await loadProfile(files, a.id))?.name).toBe('Alpha');
    expect(a.language).toBe('us');

    const patched = await updateProfile(files, a.id, { name: 'Alpha2' });
    expect(patched?.name).toBe('Alpha2');
    expect((await loadProfile(files, a.id))?.name).toBe('Alpha2');
  });

  it('round-trips per-profile config (empty on create)', async () => {
    const files = memFiles();
    const p = await createProfile(files, { name: 'Cfg', romFile: 'alttp.sfc' });
    expect(await readConfig(files, p.id)).toEqual({});
    await writeConfig(files, p.id, { aspectRatio: '16:9' });
    expect(await readConfig(files, p.id)).toEqual({ aspectRatio: '16:9' });
  });

  it('tracks last profile and clears it on delete', async () => {
    const files = memFiles();
    const p = await createProfile(files, { name: 'Last', romFile: 'alttp.sfc' });
    await setLastProfile(files, p.id);
    expect((await getAppState(files)).lastProfileId).toBe(p.id);

    await deleteProfile(files, p.id);
    expect(await listProfiles(files)).toHaveLength(0);
    expect((await getAppState(files)).lastProfileId).toBeNull();
  });
});
