/* @layer electron-main @kind logic */
import { handle, getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { basename, extname } from 'path';
import { readFile, access, copyFile, rm, stat } from 'fs/promises';
import { resolveSourceFiles } from '../lib/import-source';
import { ROM_EXTENSIONS } from '../lib/extensions';
import { errMessage } from '../lib/result';
import { makeImportReporter } from '../lib/import-progress';
import { listRoms, hasAssetForRom, getAssetFileName } from './store';
import { deleteRomProfiles } from './delete-rom-profiles';
import { RAW_ROM_MAX_BYTES } from './ipc-handlers.constants';

const fail = (err: unknown): ImportResult =>
  ({ success: false, error: errMessage(err), romFile: '' });

const isAlreadyImported = async (localRomPath: string): Promise<boolean> => {
  try {
    await access(localRomPath);
    return true;
  } catch {
    return false;
  }
};

const importRomFile = async (romPath: string): Promise<ImportResult> => {
  const romFile = basename(romPath);
  const localRomPath = getUserDataPath('roms', romFile);
  if (await isAlreadyImported(localRomPath)) return { success: true, romFile, alreadyExists: true };
  await copyFile(romPath, localRomPath);
  return { success: true, romFile, alreadyExists: false };
};

const selectSingleRom = (files: string[]): string => {
  if (files.length === 0) throw new Error('No ROM file (.sfc/.smc) found in the source');
  if (files.length > 1) throw new Error(`Multiple ROM files found (${files.length}). Provide exactly one ROM.`);
  return files[0];
};

const importRawDownload = async (downloadedPath: string, url: string): Promise<ImportResult> => {
  const s = await stat(downloadedPath);
  if (s.size === 0 || s.size > RAW_ROM_MAX_BYTES) {
    return { success: false, error: 'Downloaded file is not a valid ROM or archive', romFile: '' };
  }
  let romFile = basename(new URL(url).pathname);
  if (!ROM_EXTENSIONS.has(extname(romFile).toLowerCase())) romFile = `rom-${Date.now()}.sfc`;
  await copyFile(downloadedPath, getUserDataPath('roms', romFile));
  return { success: true, romFile, alreadyExists: false };
};

const registerRomHandlers = (): void => {
  handle('roms:list', () => listRoms());

  handle('roms:listWithStatus', async () => {
    const romFiles = await listRoms();
    const results = [];
    for (const romFile of romFiles) {
      const hasAssets = await hasAssetForRom(romFile);
      let assetSize: number | null = null;
      if (hasAssets) {
        try {
          const s = await stat(getUserDataPath('assets', getAssetFileName(romFile)));
          assetSize = s.size;
        } catch {
          assetSize = null;
        }
      }
      results.push({ romFile, hasAssets, assetSize });
    }
    return results;
  });

  handle('roms:import', async (_event, romPath: string): Promise<ImportResult> => {
    const report = makeImportReporter('rom', basename(romPath));
    let resolved;
    try {
      resolved = await resolveSourceFiles({ kind: 'path', path: romPath }, ROM_EXTENSIONS, (s) => report(s.phase, s.loaded, s.total));
    } catch (err) {
      report('error', undefined, undefined, errMessage(err));
      return fail(err);
    }
    try {
      const result = await importRomFile(selectSingleRom(resolved.files));
      report('done');
      return result;
    } catch (err) {
      report('error', undefined, undefined, errMessage(err));
      return fail(err);
    } finally {
      await resolved.cleanup();
    }
  });

  handle('roms:importUrl', async (_event, url: string): Promise<ImportResult> => {
    const report = makeImportReporter('rom', 'rom');
    let resolved;
    try {
      resolved = await resolveSourceFiles({ kind: 'url', url }, ROM_EXTENSIONS, (s) => report(s.phase, s.loaded, s.total));
    } catch (err) {
      report('error', undefined, undefined, errMessage(err));
      return fail(err);
    }
    try {
      const result = (!resolved.extractedArchive && resolved.downloadedPath)
        ? await importRawDownload(resolved.downloadedPath, url)
        : await importRomFile(selectSingleRom(resolved.files));
      if (result.success) report('done');
      else report('error', undefined, undefined, result.error);
      return result;
    } catch (err) {
      report('error', undefined, undefined, errMessage(err));
      return fail(err);
    } finally {
      await resolved.cleanup();
    }
  });

  handle('roms:delete', async (_event, romFile: string) => {
    await rm(getUserDataPath('roms', romFile), { force: true });
    await rm(getUserDataPath('assets', getAssetFileName(romFile)), { force: true });
    await deleteRomProfiles(romFile);
  });

  handle('roms:getInfo', async (_event, romFile: string) => {
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
};

export { registerRomHandlers };
