import { ipcMain } from 'electron';
import { join, extname } from 'path';
import { readFile, writeFile, mkdir, readdir, access, rm } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { getMainWindow } from '../window';
import { extractArchiveToTemp, walkFiles } from '../lib/archive';
import { downloadToTemp } from '../lib/download';
import { loadRom } from '../../../../shared/asset-extraction/rom/rom-loader';
import { decodeStrings, formatDialogueText } from '../../../../shared/asset-extraction/text/dialogue-decoder';

const ROM_EXTENSIONS = new Set(['.sfc', '.smc']);

const resolveRomFile = async (filePath: string): Promise<{ romPath: string; tempDir?: string }> => {
  const ext = extname(filePath).toLowerCase();
  if (ROM_EXTENSIONS.has(ext)) {
    return { romPath: filePath };
  }
  if (ext === '.zip' || ext === '.7z' || ext === '.rar') {
    const tempDir = await extractArchiveToTemp(filePath);
    const roms = await walkFiles(tempDir, ROM_EXTENSIONS);
    if (roms.length === 0) throw new Error('No ROM file (.sfc/.smc) found inside the archive');
    if (roms.length > 1) throw new Error(`Multiple ROM files found (${roms.length}). Use an archive with exactly one ROM.`);
    return { romPath: roms[0], tempDir };
  }
  throw new Error('Unsupported file type');
};

const extractDialogueFromRom = async (romAbsPath: string, langDir: string, langCode: string): Promise<{ success: boolean; error?: string }> => {
  const sendLog = (channel: string, level: string, message: string) => {
    getMainWindow()?.webContents.send('log:entry', { channel, level, message });
  };
  sendLog('app', 'info', `Extracting language '${langCode}'...`);

  try {
    const rom = loadRom(romAbsPath, true);
    const strings = decodeStrings((addr: number) => rom.getByte(addr), rom.language);
    const text = formatDialogueText(strings);
    await mkdir(langDir, { recursive: true });
    await writeFile(join(langDir, 'dialogue.txt'), text, 'utf-8');
    sendLog('app', 'info', `Language '${langCode}' extracted successfully (${strings.length} strings)`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    sendLog('error', 'error', `Language extraction failed: ${msg}`);
    return { success: false, error: msg };
  }
};

export const registerLanguageHandlers = () => {
  ipcMain.handle('languages:list', async () => {
    const langDir = getUserDataPath('languages');
    try {
      const entries = await readdir(langDir, { withFileTypes: true });
      const langs: { code: string; fileCount: number }[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const dir = join(langDir, entry.name);
        const files = await readdir(dir);
        langs.push({ code: entry.name, fileCount: files.length });
      }
      return langs;
    } catch { return []; }
  });

  ipcMain.handle('languages:extract', async (_event, romFile: string, langCode: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    try { await access(localRomPath); } catch {
      return { success: false, error: `ROM not found: ${romFile}` };
    }
    const langDir = getUserDataPath('languages', langCode);
    return extractDialogueFromRom(localRomPath, langDir, langCode);
  });

  ipcMain.handle('languages:extractFromFile', async (_event, filePath: string, langCode: string) => {
    try {
      const { romPath, tempDir } = await resolveRomFile(filePath);
      try {
        const langDir = getUserDataPath('languages', langCode);
        return await extractDialogueFromRom(romPath, langDir, langCode);
      } finally {
        if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (err) {
      return { success: false, error: `${err instanceof Error ? err.message : err}` };
    }
  });

  ipcMain.handle('languages:extractFromUrl', async (_event, url: string, langCode: string) => {
    let tempFile: string | undefined;
    try {
      tempFile = await downloadToTemp(url, '.zip');
      const { romPath, tempDir } = await resolveRomFile(tempFile);
      try {
        const langDir = getUserDataPath('languages', langCode);
        return await extractDialogueFromRom(romPath, langDir, langCode);
      } finally {
        if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (err) {
      return { success: false, error: `${err instanceof Error ? err.message : err}` };
    } finally {
      if (tempFile) await rm(tempFile, { force: true }).catch(() => {});
    }
  });

  ipcMain.handle('languages:delete', async (_event, langCode: string) => {
    await rm(getUserDataPath('languages', langCode), { recursive: true, force: true });
  });

  ipcMain.handle('languages:getDialogue', async (_event, langCode: string) => {
    try {
      return await readFile(getUserDataPath('languages', langCode, 'dialogue.txt'), 'utf-8');
    } catch { return null; }
  });
};
