/* @layer electron-main @kind logic */
import { join, basename } from 'path';
import { isAudioFile, trackNumberOf } from '@rotp/msu';
import { handle, getUserDataPath, toArrayBuffer } from '@drizztdourden08/brock-electron/main';
import { readFile, readdir, mkdir, copyFile, rm } from 'fs/promises';
import { resolveSourceFiles, type ImportSource } from '../lib/import-source';
import { MSU_EXTENSIONS } from '../lib/extensions';
import { fail, errMessage } from '../lib/result';
import { makeImportReporter } from '../lib/import-progress';
import { selectPackFiles } from './import-selection';
import { refuseInstalledPack } from './pack-fs';
import { packSummary } from './pack-summary';
import { statOrNull } from './stat-or-null';
import type { MsuImportResult, MsuPackSummary } from './ipc-handlers.type';

const getMsuDir = (packName: string): string => getUserDataPath('msu', packName);

const isMsuFile = (name: string): boolean => isAudioFile(name);

const installMsuTracks = async (source: ImportSource, packName: string): Promise<MsuImportResult> => {
  const report = makeImportReporter('msu', packName);
  let resolved;
  try {
    await refuseInstalledPack(packName);
    resolved = await resolveSourceFiles(source, MSU_EXTENSIONS, (s) => report(s.phase, s.loaded, s.total));
  } catch (err) {
    report('error', undefined, undefined, errMessage(err));
    return fail(err);
  }
  try {
    if (resolved.files.length === 0) {
      const error = 'No audio tracks (.pcm/.opuz/.msu) found in the source. This may be a patch file, not an MSU audio pack.';
      report('error', undefined, undefined, error);
      return { success: false, error };
    }
    const selected = selectPackFiles(resolved.files);
    const msuDir = getMsuDir(packName);
    await mkdir(msuDir, { recursive: true });
    let copied = 0;
    for (const f of selected.files) {
      await copyFile(f, join(msuDir, basename(f)));
      report('copy', ++copied, selected.files.length);
    }
    report('done');
    return {
      success: true,
      fileCount: selected.files.length,
      skippedNested: selected.nested.length,
      skippedDuplicate: selected.duplicates.length,
    };
  } catch (err) {
    report('error', undefined, undefined, errMessage(err));
    return fail(err);
  } finally {
    await resolved.cleanup();
  }
};

const registerMsuHandlers = (): void => {
  handle('msu:import', (_event, packName: string, url: string) =>
    installMsuTracks({ kind: 'url', url }, packName));

  handle('msu:importFile', (_event, packName: string, filePath: string) =>
    installMsuTracks({ kind: 'path', path: filePath }, packName));

  handle('msu:listPacks', async () => {
    const msuDir = getUserDataPath('msu');
    try {
      const entries = await readdir(msuDir, { withFileTypes: true });
      const packs: MsuPackSummary[] = [];
      for (const entry of entries) {
        if (entry.isDirectory()) packs.push(await packSummary(msuDir, entry.name));
      }
      return packs;
    } catch { return []; }
  });

  handle('msu:getPackFiles', async (_event, packName: string) => {
    const packDir = getMsuDir(packName);
    try {
      const results: { name: string; size: number }[] = [];
      for (const f of (await readdir(packDir)).filter(isMsuFile)) {
        const st = await statOrNull(packDir, f);
        if (st) results.push({ name: f, size: st.size });
      }
      return results;
    } catch { return []; }
  });

  handle('msu:deletePack', async (_event, packName: string) => {
    await refuseInstalledPack(packName);
    await rm(getMsuDir(packName), { recursive: true, force: true });
  });

  handle('msu:getTrackList', async (_event, packName: string) => {
    const packDir = getMsuDir(packName);
    try {
      const files = await readdir(packDir);
      const tracks: { fileName: string; trackNum: number; ext: string }[] = [];
      for (const f of files) {
        const trackNum = trackNumberOf(f);
        if (trackNum === null) continue;
        tracks.push({ fileName: f, trackNum, ext: (f.split('.').pop() ?? '').toLowerCase() });
      }
      return tracks;
    } catch { return []; }
  });

  handle('msu:readMsulFile', async (_event, filePath: string) => {
    if (!filePath.toLowerCase().endsWith('.msul')) throw new Error('Not a music-pack file');
    return toArrayBuffer(await readFile(filePath));
  });

  handle('msu:readTrackFile', async (_event, packName: string, fileName: string) => {
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error('Invalid filename');
    }
    return toArrayBuffer(await readFile(join(getMsuDir(packName), fileName)));
  });
};

export { registerMsuHandlers };
