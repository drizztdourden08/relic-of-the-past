/* @layer electron-main @kind logic */
import { join, basename } from 'path';
import { isAudioFile, trackNumberOf } from '@shared/storage/msu-paths';
import { handle } from '../lib/ipc/handle';
import { readFile, readdir, mkdir, copyFile, rm, stat } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { resolveSourceFiles, type ImportSource } from '../lib/import-source';
import { MSU_EXTENSIONS } from '../lib/extensions';
import { toArrayBuffer } from '../lib/buffer';
import { fail, errMessage } from '../lib/result';
import { makeImportReporter } from '../lib/import-progress';
import { selectPackFiles } from './import-selection';

type MsuImportResult = {
  success: boolean;
  fileCount?: number;
  error?: string;
  /** Audio the archive kept below the pack's own level — alternates and extras, not tracks. */
  skippedNested?: number;
  /** Audio dropped because an earlier file already claimed its track number. */
  skippedDuplicate?: number;
};

const getMsuDir = (packName: string): string => getUserDataPath('msu', packName);

// The shared set, so a format the pack can hold is a format the pack is counted by. A private
// `(pcm|opuz|msu)` here is what made a converted pack list as empty.
const isMsuFile = (name: string): boolean => isAudioFile(name);

// Resolve a source to its MSU tracks and copy them all into the pack dir.
const installMsuTracks = async (source: ImportSource, packName: string): Promise<MsuImportResult> => {
  const report = makeImportReporter('msu', packName);
  let resolved;
  try {
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
    // Extras in subfolders are not tracks, and two files cannot share a slot — see selectPackFiles.
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
      const packs: { name: string; fileCount: number; totalSize: number }[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const packDir = join(msuDir, entry.name);
        const msuFiles = (await readdir(packDir)).filter(isMsuFile);
        let totalSize = 0;
        for (const f of msuFiles) {
          try { totalSize += (await stat(join(packDir, f))).size; } catch { /* skip */ }
        }
        packs.push({ name: entry.name, fileCount: msuFiles.length, totalSize });
      }
      return packs;
    } catch { return []; }
  });

  handle('msu:getPackFiles', async (_event, packName: string) => {
    const packDir = getMsuDir(packName);
    try {
      const results: { name: string; size: number }[] = [];
      for (const f of (await readdir(packDir)).filter(isMsuFile)) {
        try {
          results.push({ name: f, size: (await stat(join(packDir, f))).size });
        } catch { /* skip */ }
      }
      return results;
    } catch { return []; }
  });

  handle('msu:deletePack', (_event, packName: string) =>
    rm(getMsuDir(packName), { recursive: true, force: true }));

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

  // A pack file the app was opened with (file association). Scoped to the one extension on
  // purpose: this reads a path chosen outside the app's own storage, so it must not become a
  // general-purpose file reader for the renderer.
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
