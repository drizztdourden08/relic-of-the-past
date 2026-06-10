/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { join } from 'path';
import { readFile, writeFile, mkdir, readdir, access, rm } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { logToRenderer } from '../lib/renderer-log';
import { resolveSourceFiles, type ImportSource } from '../lib/import-source';
import { ROM_EXTENSIONS } from '../lib/extensions';
import { loadRom } from '@shared/asset-extraction/rom/rom-loader';
import { decodeStrings, formatDialogueText } from '@shared/asset-extraction/text/dialogue-decoder';
import { fail, errMessage } from '../lib/result';
import { makeImportReporter } from '../lib/import-progress';

type ExtractResult = { success: boolean; error?: string };

const extractDialogueFromRom = async (romAbsPath: string, langCode: string): Promise<ExtractResult> => {
  const report = makeImportReporter('language', langCode);
  logToRenderer('app', 'info', `Extracting language '${langCode}'...`);
  try {
    report('decode', undefined, undefined, 'Decoding dialogue…');
    const rom = loadRom(romAbsPath, true);
    const strings = decodeStrings((addr: number) => rom.getByte(addr), rom.language);
    const langDir = getUserDataPath('languages', langCode);
    await mkdir(langDir, { recursive: true });
    await writeFile(join(langDir, 'dialogue.txt'), formatDialogueText(strings), 'utf-8');
    logToRenderer('app', 'info', `Language '${langCode}' extracted successfully (${strings.length} strings)`);
    report('done');
    return { success: true };
  } catch (err) {
    const msg = errMessage(err);
    logToRenderer('error', 'error', `Language extraction failed: ${msg}`);
    report('error', undefined, undefined, msg);
    return { success: false, error: msg };
  }
};

// Resolve a source to exactly one ROM, extract its dialogue, then clean up temps.
const extractFromSource = async (source: ImportSource, langCode: string): Promise<ExtractResult> => {
  const report = makeImportReporter('language', langCode);
  let resolved;
  try {
    resolved = await resolveSourceFiles(source, ROM_EXTENSIONS, (s) => report(s.phase, s.loaded, s.total));
  } catch (err) {
    report('error', undefined, undefined, errMessage(err));
    return fail(err);
  }
  try {
    if (resolved.files.length === 0) throw new Error('No ROM file (.sfc/.smc) found in the source');
    if (resolved.files.length > 1) throw new Error(`Multiple ROM files found (${resolved.files.length}). Provide exactly one ROM.`);
    // extractDialogueFromRom emits its own decode/done.
    return await extractDialogueFromRom(resolved.files[0], langCode);
  } catch (err) {
    report('error', undefined, undefined, errMessage(err));
    return fail(err);
  } finally {
    await resolved.cleanup();
  }
};

const registerLanguageHandlers = () => {
  handle('languages:list', async () => {
    const langDir = getUserDataPath('languages');
    try {
      const entries = await readdir(langDir, { withFileTypes: true });
      const langs: { code: string; fileCount: number }[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const files = await readdir(join(langDir, entry.name));
        langs.push({ code: entry.name, fileCount: files.length });
      }
      return langs;
    } catch { return []; }
  });

  handle('languages:extract', async (_event, romFile: string, langCode: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    try { await access(localRomPath); } catch {
      return { success: false, error: `ROM not found: ${romFile}` };
    }
    return extractDialogueFromRom(localRomPath, langCode);
  });

  handle('languages:extractFromFile', (_event, filePath: string, langCode: string) =>
    extractFromSource({ kind: 'path', path: filePath }, langCode));

  handle('languages:extractFromUrl', (_event, url: string, langCode: string) =>
    extractFromSource({ kind: 'url', url }, langCode));

  handle('languages:delete', (_event, langCode: string) =>
    rm(getUserDataPath('languages', langCode), { recursive: true, force: true }));

  handle('languages:getDialogue', async (_event, langCode: string) => {
    try {
      return await readFile(getUserDataPath('languages', langCode, 'dialogue.txt'), 'utf-8');
    } catch { return null; }
  });
};

export { registerLanguageHandlers };
