/* @layer electron-main @kind logic */
/**
 * Generic manifest-backed save store. Each entry is a `{id}.sav` + optional
 * `{id}.png` pair in a per-profile directory, tracked by a `manifest.json`.
 * Shared mechanics for the normal + auto save stores (Template Method — callers
 * supply directory resolution and the entry→info mapping; the bespoke ops like
 * overwrite/rename/prune compose the returned primitives).
 */
import { join } from 'path';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { readJson, writeJson } from '../lib/json-store';
import { statSaveSlot, type SaveSlotStat } from './save-slot';

interface ManifestEntry {
  id: string;
  timestamp: number;
}

interface ManifestStoreConfig<TEntry extends ManifestEntry, TInfo> {
  getDir: (profileId: string) => string;
  toInfo: (entry: TEntry, slot: SaveSlotStat) => TInfo;
}

const createManifestStore = <TEntry extends ManifestEntry, TInfo>(config: ManifestStoreConfig<TEntry, TInfo>) => {
  const { getDir, toInfo } = config;

  const savPaths = (dir: string, id: string): { sav: string; png: string } =>
    ({ sav: join(dir, `${id}.sav`), png: join(dir, `${id}.png`) });

  const manifestPath = (profileId: string): string => join(getDir(profileId), 'manifest.json');

  const readManifest = (profileId: string): Promise<TEntry[]> =>
    readJson<TEntry[]>(manifestPath(profileId), []);

  const writeManifest = (profileId: string, entries: TEntry[]): Promise<void> =>
    writeJson(manifestPath(profileId), entries);

  const writePair = async (profileId: string, id: string, data: Buffer, screenshot?: Buffer): Promise<void> => {
    const { sav, png } = savPaths(getDir(profileId), id);
    await mkdir(getDir(profileId), { recursive: true });
    await writeFile(sav, data);
    if (screenshot) await writeFile(png, screenshot);
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
      if (slot) valid.push({ entry, slot }); // file missing — skip orphaned manifest entry
    }
    valid.sort((a, b) => b.entry.timestamp - a.entry.timestamp); // newest first
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
    const { sav, png } = savPaths(getDir(profileId), id);
    try { await unlink(sav); } catch { /* ignore */ }
    try { await unlink(png); } catch { /* ignore */ }
  };

  return { savPaths, manifestPath, readManifest, writeManifest, writePair, append, list, load, loadScreenshot, remove };
};

export { createManifestStore };
export type { ManifestEntry, ManifestStoreConfig };
