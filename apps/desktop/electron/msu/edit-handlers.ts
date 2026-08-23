/* @layer electron-main @kind logic */
/**
 * Pack-editing IPC: the `.msul` manifest plus per-file create/rename/delete. Same
 * operations as shared/storage/msu-edit, expressed over Node fs; the manifest format
 * and validation come from that module so the two never drift.
 *
 * Paths and manifest reads/writes come from ./pack-fs, which is also what guards every
 * renderer-supplied name against traversal before it becomes a path segment.
 */
import { join, dirname } from 'path';
import { writeFile, readdir, rename, rm, stat, mkdir } from 'fs/promises';
import type { MsuPackManifest, MsuPackMeta } from '@shared/types/msu-manifest';
import { isAudioFile } from '@shared/storage/msu-paths';
import { newManifest } from '@shared/storage/msu-edit';
import { handle } from '../lib/ipc/handle';
import { packFilePath, packPath, pathExists, readPackManifest, writePackManifest } from './pack-fs';

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

  handle('msu:readManifest', (_event, packName: string) => readPackManifest(packName));

  handle('msu:writeManifest', (_event, packName: string, manifest: MsuPackManifest) =>
    writePackManifest(packName, manifest));

  handle('msu:createPack', async (_event, packName: string, meta?: Partial<MsuPackMeta>) => {
    if (await pathExists(packPath(packName))) throw new Error(`MSU pack already exists: ${packName}`);
    await writePackManifest(packName, newManifest(packName, meta));
  });

  handle('msu:renamePack', async (_event, from: string, to: string) => {
    if (from === to) return;
    if (await pathExists(packPath(to))) throw new Error(`MSU pack already exists: ${to}`);
    await rename(packPath(from), packPath(to));
  });

  handle('msu:renameTrackFile', async (_event, packName: string, from: string, to: string) => {
    if (from === to) return;
    await rename(packFilePath(packName, from), packFilePath(packName, to));
  });

  handle('msu:deleteTrackFile', (_event, packName: string, fileName: string) =>
    rm(packFilePath(packName, fileName), { force: true }));

  handle('msu:writeTrackFile', async (_event, packName: string, fileName: string, data: ArrayBuffer) => {
    const path = packFilePath(packName, fileName);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, Buffer.from(data));
  });
};

export { registerMsuEditHandlers };
