/* @layer shared-storage @kind logic */
/**
 * Manifest-backed save store over FileStore. Each entry is a `{id}.sav` + optional
 * `{id}.png` pair tracked in `manifest.json`. Shared mechanics for normal + auto
 * saves (mirrors the Electron manifest-store, now platform-neutral).
 */
import type { FileStore } from '@shared/platform';
import { msuSidecarPath } from './save-paths';

interface ManifestEntry {
  id: string;
  timestamp: number;
}

const createManifestSaves = <T extends ManifestEntry>(files: FileStore, dir: string) => {
  const sav = (id: string): string => `${dir}/${id}.sav`;
  const png = (id: string): string => `${dir}/${id}.png`;
  const msu = (id: string): string => msuSidecarPath(dir, id);
  const manifestPath = `${dir}/manifest.json`;

  const readManifest = async (): Promise<T[]> => {
    const text = await files.readText(manifestPath);
    if (!text) return [];
    try { return JSON.parse(text) as T[]; } catch { return []; }
  };

  const writeManifest = (entries: T[]): Promise<void> =>
    files.writeText(manifestPath, JSON.stringify(entries, null, 2));

  // Writing over a save invalidates its music-resume sidecar: the position belonged
  // to the state that was there before. A caller with a fresh snapshot writes it
  // after this call, never before.
  const writePair = async (id: string, data: Uint8Array, screenshot?: Uint8Array): Promise<void> => {
    await files.writeBytes(sav(id), data);
    if (screenshot) await files.writeBytes(png(id), screenshot);
    await files.remove(msu(id));
  };

  const append = async (entry: T, data: Uint8Array, screenshot?: Uint8Array): Promise<void> => {
    await writePair(entry.id, data, screenshot);
    const manifest = await readManifest();
    manifest.push(entry);
    await writeManifest(manifest);
  };

  // Manifest entries whose .sav still exists, newest first, with size + screenshot flag.
  const valid = async (): Promise<{ entry: T; bytes: number; hasScreenshot: boolean }[]> => {
    const out: { entry: T; bytes: number; hasScreenshot: boolean }[] = [];
    for (const entry of await readManifest()) {
      const stat = await files.stat(sav(entry.id));
      if (!stat) continue;
      out.push({ entry, bytes: stat.bytes, hasScreenshot: await files.exists(png(entry.id)) });
    }
    out.sort((a, b) => b.entry.timestamp - a.entry.timestamp);
    return out;
  };

  const load = (id: string): Promise<Uint8Array | null> => files.readBytes(sav(id));
  const loadScreenshot = (id: string): Promise<Uint8Array | null> => files.readBytes(png(id));

  const remove = async (id: string): Promise<void> => {
    const manifest = await readManifest();
    await writeManifest(manifest.filter((e) => e.id !== id));
    await files.remove(sav(id));
    await files.remove(png(id));
    await files.remove(msu(id)); // the music-resume sidecar dies with its save
  };

  return { sav, png, msu, readManifest, writeManifest, writePair, append, valid, load, loadScreenshot, remove };
};

export { createManifestSaves };
export type { ManifestEntry };
