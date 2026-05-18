import { join, basename, extname } from 'path';
import { ipcMain } from 'electron';
import { readFile, readdir, mkdir, copyFile, rm, stat } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { extractArchiveToTemp, walkFiles } from '../lib/archive';
import { downloadToTemp } from '../lib/download';

const MSU_EXTENSIONS = new Set(['.pcm', '.opuz', '.msu']);

function getMsuDir(packName: string): string {
  return getUserDataPath('msu', packName);
}

async function extractArchiveToMsu(archivePath: string, msuDir: string): Promise<number> {
  const tempDir = await extractArchiveToTemp(archivePath);
  try {
    await mkdir(msuDir, { recursive: true });
    const msuFiles = await walkFiles(tempDir, MSU_EXTENSIONS);
    for (const f of msuFiles) {
      await copyFile(f, join(msuDir, basename(f)));
    }
    return msuFiles.length;
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export function registerMsuHandlers(): void {
  ipcMain.handle('msu:import', async (_event, packName: string, url: string) => {
    let tempFile: string | undefined;
    try {
      tempFile = await downloadToTemp(url, '.zip');
      const msuDir = getMsuDir(packName);
      const fileCount = await extractArchiveToMsu(tempFile, msuDir);
      if (fileCount === 0) {
        await rm(msuDir, { recursive: true, force: true }).catch(() => {});
        return { success: false, error: 'No audio tracks (.pcm/.opuz/.msu) found in the archive. This may be a patch file, not an MSU audio pack.' };
      }
      return { success: true, fileCount };
    } catch (e) {
      return { success: false, error: `${e instanceof Error ? e.message : e}` };
    } finally {
      if (tempFile) await rm(tempFile, { force: true }).catch(() => {});
    }
  });

  ipcMain.handle('msu:importFile', async (_event, packName: string, filePath: string) => {
    try {
      const msuDir = getMsuDir(packName);
      const ext = extname(filePath).toLowerCase();

      if (ext === '.zip' || ext === '.7z' || ext === '.rar') {
        const fileCount = await extractArchiveToMsu(filePath, msuDir);
        if (fileCount === 0) {
          await rm(msuDir, { recursive: true, force: true }).catch(() => {});
          return { success: false, error: 'No audio tracks (.pcm/.opuz/.msu) found in the archive. This may be a patch file, not an MSU audio pack.' };
        }
        return { success: true, fileCount };
      } else if (MSU_EXTENSIONS.has(ext)) {
        await mkdir(msuDir, { recursive: true });
        await copyFile(filePath, join(msuDir, basename(filePath)));
        return { success: true, fileCount: 1 };
      } else {
        return { success: false, error: 'Unsupported file type. Use .zip, .7z, .rar, .pcm, or .opuz files.' };
      }
    } catch (e) {
      return { success: false, error: `${e instanceof Error ? e.message : e}` };
    }
  });

  ipcMain.handle('msu:listPacks', async () => {
    const msuDir = getUserDataPath('msu');
    try {
      const entries = await readdir(msuDir, { withFileTypes: true });
      const packs: { name: string; fileCount: number; totalSize: number }[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const packDir = join(msuDir, entry.name);
        const files = await readdir(packDir);
        const msuFiles = files.filter((f) => /\.(pcm|opuz|msu)$/i.test(f));
        let totalSize = 0;
        for (const f of msuFiles) {
          try { totalSize += (await stat(join(packDir, f))).size; } catch { /* skip */ }
        }
        packs.push({ name: entry.name, fileCount: msuFiles.length, totalSize });
      }
      return packs;
    } catch { return []; }
  });

  ipcMain.handle('msu:getPackFiles', async (_event, packName: string) => {
    const packDir = getUserDataPath('msu', packName);
    try {
      const files = await readdir(packDir);
      const results: { name: string; size: number }[] = [];
      for (const f of files) {
        if (/\.(pcm|opuz|msu)$/i.test(f)) {
          try {
            const s = await stat(join(packDir, f));
            results.push({ name: f, size: s.size });
          } catch { /* skip */ }
        }
      }
      return results;
    } catch { return []; }
  });

  ipcMain.handle('msu:deletePack', async (_event, packName: string) => {
    await rm(getUserDataPath('msu', packName), { recursive: true, force: true });
  });

  ipcMain.handle('msu:getTrackList', async (_event, packName: string) => {
    const packDir = getUserDataPath('msu', packName);
    try {
      const files = await readdir(packDir);
      const tracks: { fileName: string; trackNum: number; ext: string }[] = [];
      for (const f of files) {
        const match = f.match(/(\d+)\.(pcm|opuz)$/i);
        if (!match) continue;
        tracks.push({ fileName: f, trackNum: parseInt(match[1]), ext: match[2].toLowerCase() });
      }
      return tracks;
    } catch { return []; }
  });

  ipcMain.handle('msu:readTrackFile', async (_event, packName: string, fileName: string) => {
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error('Invalid filename');
    }
    const filePath = join(getUserDataPath('msu', packName), fileName);
    const buf = await readFile(filePath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  });
}
