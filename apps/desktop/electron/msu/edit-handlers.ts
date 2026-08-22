/* @layer electron-main @kind logic */
/**
 * Pack-editing IPC: the `.msul` manifest plus per-file create/rename/delete. Same
 * operations as shared/storage/msu-edit, expressed over Node fs; the manifest format
 * and validation come from that module so the two never drift.
 */
import { join, dirname } from 'path';
import { readFile, writeFile, readdir, rename, rm, stat, mkdir } from 'fs/promises';
import type { MsuPackManifest, MsuPackMeta } from '@shared/types/msu-manifest';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { isAudioFile, isSafeName } from '@shared/storage/msu-paths';
import { newManifest, parseManifest, serializeManifest } from '@shared/storage/msu-edit';
import { handle } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';

// Pack and file names reach us from the renderer, so guard every path segment.
const safe = (name: string): string => {
  if (!isSafeName(name)) throw new Error('Invalid filename');
  return name;
};

const packPath = (pack: string): string => getUserDataPath('msu', safe(pack));
const filePath = (pack: string, fileName: string): string => join(packPath(pack), safe(fileName));
const manifestFile = (pack: string): string => join(packPath(pack), MSUL_MANIFEST_NAME);

const exists = async (path: string): Promise<boolean> => {
  try { await stat(path); return true; } catch { return false; }
};

const readText = async (path: string): Promise<string | null> => {
  try { return await readFile(path, 'utf-8'); } catch { return null; }
};

const writeManifestFile = async (pack: string, manifest: MsuPackManifest): Promise<void> => {
  const path = manifestFile(pack);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, serializeManifest(manifest), 'utf-8');
};

const registerMsuEditHandlers = (): void => {
  handle('msu:listAudioFiles', async (_event, packName: string) => {
    try {
      const dir = packPath(packName);
      const out: { name: string; size: number }[] = [];
      for (const f of (await readdir(dir)).filter(isAudioFile)) {
        try {
          const st = await stat(join(dir, f));
          if (st.isFile()) out.push({ name: f, size: st.size });
        } catch { /* skip */ }
      }
      return out;
    } catch { return []; }
  });

  handle('msu:readManifest', async (_event, packName: string) =>
    parseManifest(await readText(manifestFile(packName))));

  handle('msu:writeManifest', (_event, packName: string, manifest: MsuPackManifest) =>
    writeManifestFile(packName, manifest));

  handle('msu:createPack', async (_event, packName: string, meta?: Partial<MsuPackMeta>) => {
    if (await exists(packPath(packName))) throw new Error(`MSU pack already exists: ${packName}`);
    await writeManifestFile(packName, newManifest(packName, meta));
  });

  handle('msu:renamePack', async (_event, from: string, to: string) => {
    if (from === to) return;
    if (await exists(packPath(to))) throw new Error(`MSU pack already exists: ${to}`);
    await rename(packPath(from), packPath(to));
  });

  handle('msu:renameTrackFile', async (_event, packName: string, from: string, to: string) => {
    if (from === to) return;
    await rename(filePath(packName, from), filePath(packName, to));
  });

  handle('msu:deleteTrackFile', (_event, packName: string, fileName: string) =>
    rm(filePath(packName, fileName), { force: true }));

  handle('msu:writeTrackFile', async (_event, packName: string, fileName: string, data: ArrayBuffer) => {
    const path = filePath(packName, fileName);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, Buffer.from(data));
  });
};

export { registerMsuEditHandlers };
