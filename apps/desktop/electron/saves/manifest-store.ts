/* @layer electron-main @kind logic */
import { join } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { readJsonFile, writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { MSU_SIDECAR_SUFFIX } from '@shared/storage/save-paths';
import { statSaveSlot, type SaveSlotStat } from './save-slot';
import { removeIfPresent } from './remove-if-present';
import type { ManifestEntry, ManifestStoreConfig } from './manifest-store.type';

const createManifestStore = <TEntry extends ManifestEntry, TInfo>(config: ManifestStoreConfig<TEntry, TInfo>) => {
  const { getDir, toInfo } = config;

  const savPaths = (dir: string, id: string): { sav: string; png: string } =>
    ({ sav: join(dir, `${id}.sav`), png: join(dir, `${id}.png`) });

  const msuPath = (dir: string, id: string): string => join(dir, `${id}${MSU_SIDECAR_SUFFIX}`);

  const manifestPath = (profileId: string): string => join(getDir(profileId), 'manifest.json');

  const readManifest = (profileId: string): Promise<TEntry[]> =>
    readJsonFile<TEntry[]>(manifestPath(profileId), []);

  const writeManifest = (profileId: string, entries: TEntry[]): Promise<void> =>
    writeJsonFile(manifestPath(profileId), entries);

  const writePair = async (profileId: string, id: string, data: Buffer, screenshot?: Buffer): Promise<void> => {
    const dir = getDir(profileId);
    const { sav, png } = savPaths(dir, id);
    await mkdir(dir, { recursive: true });
    await writeFile(sav, data);
    if (screenshot) await writeFile(png, screenshot);
    await removeIfPresent(msuPath(dir, id));
  };

  const append = async (profileId: string, entry: TEntry, data: Buffer, screenshot?: Buffer): Promise<void> => {
    await writePair(profileId, entry.id, data, screenshot);
    const manifest = await readManifest(profileId);
    manifest.push(entry);
    await writeManifest(profileId, manifest);
  };

  const list = async (profileId: string): Promise<TInfo[]> => {
    const dir = getDir(profileId);
    const manifest = await readManifest(profileId);
    const valid: { entry: TEntry; slot: SaveSlotStat }[] = [];
    for (const entry of manifest) {
      const { sav, png } = savPaths(dir, entry.id);
      const slot = await statSaveSlot(sav, png);
      if (slot) valid.push({ entry, slot });
    }
    const newestFirst = (a: { entry: TEntry }, b: { entry: TEntry }): number => b.entry.timestamp - a.entry.timestamp;
    valid.sort(newestFirst);
    return valid.map(({ entry, slot }) => toInfo(entry, slot));
  };

  const load = async (profileId: string, id: string): Promise<Buffer | null> => {
    try { return await readFile(savPaths(getDir(profileId), id).sav); } catch { return null; }
  };

  const loadScreenshot = async (profileId: string, id: string): Promise<Buffer | null> => {
    try { return await readFile(savPaths(getDir(profileId), id).png); } catch { return null; }
  };

  const remove = async (profileId: string, id: string): Promise<void> => {
    const manifest = await readManifest(profileId);
    await writeManifest(profileId, manifest.filter((e) => e.id !== id));
    const dir = getDir(profileId);
    const { sav, png } = savPaths(dir, id);
    await removeIfPresent(sav);
    await removeIfPresent(png);
    await removeIfPresent(msuPath(dir, id));
  };

  return {
    savPaths, msuPath, manifestPath, readManifest, writeManifest, writePair, append, list, load, loadScreenshot, remove,
  };
};

export { createManifestStore };
export type { ManifestEntry, ManifestStoreConfig };
