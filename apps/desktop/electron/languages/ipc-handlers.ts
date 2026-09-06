/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { access, rm } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { logToRenderer } from '../lib/renderer-log';
import { resolveSourceFiles, type ImportSource } from '../lib/import-source';
import { ROM_EXTENSIONS } from '../lib/extensions';
import { loadRom } from '@shared/asset-extraction/rom/load-rom-file';
import { fail, errMessage } from '../lib/result';
import { makeImportReporter } from '../lib/import-progress';
import { extractLanguagePack, listLanguageSummaries, readLanguagePack } from './language-pack';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { createNodeFileStore } from '../lib/node-file-store';
import { createSet, duplicateSet, getSet, list, saveSet } from '@shared/storage/languages';
import type { NewSetParams } from '@shared/storage/languages';
import type { LanguageSet } from '@shared/game/language';

const files = createNodeFileStore();

type ExtractResult = { success: boolean; error?: string };

const extractDialogueFromRom = async (romAbsPath: string, langCode: string): Promise<ExtractResult> => {
  const report = makeImportReporter('language', langCode);
  logToRenderer('app', 'info', `Extracting language '${langCode}'...`);
  try {
    report('decode', undefined, undefined, 'Decoding dialogue...');
    const rom = loadRom(romAbsPath, true);
    // The picked code must match the ROM's region, or the font/encoder configs won't line up.
    if (rom.language !== langCode) {
      throw new Error(`Selected '${langCode}' but this ROM is '${rom.language}' (${rom.description}). Pick the matching language.`);
    }
    const meta = await extractLanguagePack(rom, rom.language);
    logToRenderer('app', 'info', `Language '${rom.language}' extracted (${meta.lineCount} strings, ${meta.glyphCount} glyphs)`);
    report('extract', undefined, undefined, 'Baking into assets...');
    await recompileAllAssets();
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
    return await extractDialogueFromRom(resolved.files[0], langCode);
  } catch (err) {
    report('error', undefined, undefined, errMessage(err));
    return fail(err);
  } finally {
    await resolved.cleanup();
  }
};

const registerLanguageHandlers = () => {
  handle('languages:list', () => listLanguageSummaries());

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

  handle('languages:delete', async (_event, langCode: string) => {
    await rm(getUserDataPath('languages', langCode), { recursive: true, force: true });
    await recompileAllAssets();
  });

  handle('languages:getLanguage', (_event, langCode: string) => readLanguagePack(langCode));

  handle('languages:listSets', () => list(files));

  handle('languages:getSet', (_event, id: string) => getSet(files, id));

  handle('languages:saveSet', async (_event, set: LanguageSet) => {
    await saveSet(files, set);
    await recompileAllAssets();
  });

  handle('languages:createSet', async (_event, params: NewSetParams) => {
    const set = await createSet(files, params);
    await recompileAllAssets();
    return set;
  });

  handle('languages:duplicateSet', async (_event, sourceId: string, id: string, name: string) => {
    const set = await duplicateSet(files, sourceId, id, name);
    await recompileAllAssets();
    return set;
  });
};

export { registerLanguageHandlers };
