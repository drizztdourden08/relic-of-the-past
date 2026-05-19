import { ipcMain } from 'electron';
import { basename, extname } from 'path';
import { readFile, access, copyFile, rm, stat } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { extractArchiveToTemp, walkFiles } from '../lib/archive';
import { downloadToTemp } from '../lib/download';
import { listRoms, hasAssetForRom, getAssetFileName } from './store';
import { listProfiles, deleteProfile } from '../profiles/store';
import { loadAppState, saveAppState } from '../profiles/app-state';

const ROM_EXTENSIONS = new Set(['.sfc', '.smc']);

function registerRomHandlers(): void {
  ipcMain.handle('roms:list', () => listRoms());

  ipcMain.handle('roms:listWithStatus', async () => {
    const romFiles = await listRoms();
    const results = [];
    for (const romFile of romFiles) {
      const hasAssets = await hasAssetForRom(romFile);
      let assetSize: number | null = null;
      if (hasAssets) {
        try {
          const assetFile = getAssetFileName(romFile);
          const s = await stat(getUserDataPath('assets', assetFile));
          assetSize = s.size;
        } catch { /* ignore */ }
      }
      results.push({ romFile, hasAssets, assetSize });
    }
    return results;
  });

  ipcMain.handle('roms:import', async (_event, romPath: string) => {
    try {
      const ext = extname(romPath).toLowerCase();

      if (ROM_EXTENSIONS.has(ext)) {
        const romFileName = basename(romPath);
        const localRomPath = getUserDataPath('roms', romFileName);
        try {
          await access(localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: true };
        } catch { /* not imported yet */ }
        await copyFile(romPath, localRomPath);
        return { success: true, romFile: romFileName, alreadyExists: false };
      }

      if (ext === '.zip' || ext === '.7z' || ext === '.rar') {
        const tempDir = await extractArchiveToTemp(romPath);
        try {
          const romFiles = await walkFiles(tempDir, ROM_EXTENSIONS);
          if (romFiles.length === 0) {
            return { success: false, error: 'No ROM file (.sfc/.smc) found inside the archive', romFile: '' };
          }
          if (romFiles.length > 1) {
            return { success: false, error: `Multiple ROM files found inside the archive (${romFiles.length}). Archives must contain exactly one ROM.`, romFile: '' };
          }
          const foundRom = romFiles[0];
          const romFileName = basename(foundRom);
          const localRomPath = getUserDataPath('roms', romFileName);
          try {
            await access(localRomPath);
            return { success: true, romFile: romFileName, alreadyExists: true };
          } catch { /* not imported yet */ }
          await copyFile(foundRom, localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: false };
        } finally {
          await rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
      }

      return { success: false, error: 'Unsupported file type. Use .sfc, .smc, .zip, .7z, or .rar files.', romFile: '' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg, romFile: '' };
    }
  });

  ipcMain.handle('roms:importUrl', async (_event, url: string) => {
    try {
      const tempFile = await downloadToTemp(url, '.zip');
      try {
        const tempDir = await extractArchiveToTemp(tempFile);
        try {
          const romFiles = await walkFiles(tempDir, ROM_EXTENSIONS);
          if (romFiles.length === 0) {
            return { success: false, error: 'No ROM file (.sfc/.smc) found in the downloaded archive', romFile: '' };
          }
          if (romFiles.length > 1) {
            return { success: false, error: `Multiple ROM files found (${romFiles.length}). Archives must contain exactly one ROM.`, romFile: '' };
          }
          const foundRom = romFiles[0];
          const romFileName = basename(foundRom);
          const localRomPath = getUserDataPath('roms', romFileName);
          try {
            await access(localRomPath);
            return { success: true, romFile: romFileName, alreadyExists: true };
          } catch { /* not imported yet */ }
          await copyFile(foundRom, localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: false };
        } finally {
          await rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
      } catch {
        const s = await stat(tempFile);
        if (s.size > 0 && s.size <= 8 * 1024 * 1024) {
          const urlPath = new URL(url).pathname;
          let romFileName = basename(urlPath);
          if (!ROM_EXTENSIONS.has(extname(romFileName).toLowerCase())) {
            romFileName = `rom-${Date.now()}.sfc`;
          }
          const localRomPath = getUserDataPath('roms', romFileName);
          await copyFile(tempFile, localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: false };
        }
        return { success: false, error: 'Downloaded file is not a valid ROM or archive', romFile: '' };
      } finally {
        await rm(tempFile, { force: true }).catch(() => {});
      }
    } catch (err) {
      return { success: false, error: `${err instanceof Error ? err.message : err}`, romFile: '' };
    }
  });

  ipcMain.handle('roms:delete', async (_event, romFile: string) => {
    const romPath = getUserDataPath('roms', romFile);
    const assetFile = getAssetFileName(romFile);
    const assetPath = getUserDataPath('assets', assetFile);

    await rm(romPath, { force: true });
    await rm(assetPath, { force: true });

    const profiles = await listProfiles();
    for (const p of profiles) {
      if (p.romFile === romFile) {
        await deleteProfile(p.id);
      }
    }

    const appState = await loadAppState();
    const remaining = await listProfiles();
    if (appState.lastProfileId && !remaining.find((p) => p.id === appState.lastProfileId)) {
      appState.lastProfileId = null;
      await saveAppState(appState);
    }
  });

  ipcMain.handle('roms:getInfo', async (_event, romFile: string) => {
    const romPath = getUserDataPath('roms', romFile);
    try {
      const s = await stat(romPath);
      const data = await readFile(romPath);
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
      return {
        name: romFile,
        size: s.size,
        hash,
        created: s.birthtime.toISOString(),
        modified: s.mtime.toISOString(),
      };
    } catch { return null; }
  });
}

export { registerRomHandlers };
