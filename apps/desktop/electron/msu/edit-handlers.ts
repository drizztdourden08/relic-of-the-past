/* @layer electron-main @kind logic */
import { join, dirname } from 'path';
import { writeFile, readdir, rename, rm, stat, mkdir } from 'fs/promises';
import type { MsuPackManifest, MsuPackMeta } from '@rotp/game-data';
import { isAudioFile } from '@shared/storage/msu-paths';
import { newManifest } from '@shared/storage/msu-edit';
import { handle } from '@drizztdourden08/brock-electron/main';
import {
  packFilePath, packPath, pathExists, readPackManifest, refuseInstalledPack, writePackManifest,
} from './pack-fs';

const rewriteManifestUnderNewName = async (pack: string): Promise<void> => {
  const manifest = await readPackManifest(pack);
  if (manifest) await writePackManifest(pack, manifest);
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
        } catch {
          continue;
        }
      }
      return out;
    } catch { return []; }
  });

  handle('msu:readManifest', (_event, packName: string) => readPackManifest(packName));

  handle('msu:writeManifest', async (_event, packName: string, manifest: MsuPackManifest) => {
    await refuseInstalledPack(packName);
    await writePackManifest(packName, manifest);
  });

  handle('msu:createPack', async (_event, packName: string, meta?: Partial<MsuPackMeta>) => {
    if (await pathExists(packPath(packName))) throw new Error(`MSU pack already exists: ${packName}`);
    await refuseInstalledPack(packName);
    await writePackManifest(packName, newManifest(packName, meta));
  });

  handle('msu:renamePack', async (_event, from: string, to: string) => {
    if (from === to) return;
    if (await pathExists(packPath(to))) throw new Error(`MSU pack already exists: ${to}`);
    await refuseInstalledPack(from);
    await refuseInstalledPack(to);
    await rename(packPath(from), packPath(to));
    await rewriteManifestUnderNewName(to);
  });

  handle('msu:renameTrackFile', async (_event, packName: string, from: string, to: string) => {
    if (from === to) return;
    await refuseInstalledPack(packName);
    await rename(packFilePath(packName, from), packFilePath(packName, to));
  });

  handle('msu:deleteTrackFile', async (_event, packName: string, fileName: string) => {
    const path = packFilePath(packName, fileName);
    await refuseInstalledPack(packName);
    await rm(path, { force: true });
  });

  handle('msu:writeTrackFile', async (_event, packName: string, fileName: string, data: ArrayBuffer) => {
    const path = packFilePath(packName, fileName);
    await refuseInstalledPack(packName);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, Buffer.from(data));
  });
};

export { registerMsuEditHandlers };
