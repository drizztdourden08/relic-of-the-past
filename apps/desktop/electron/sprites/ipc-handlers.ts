/* @layer electron-main @kind logic */
import { join, basename, extname } from 'path';
import { handle, getUserDataPath, readJsonFile, writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { mkdir, access, rm } from 'fs/promises';
import { checkExtraction, writeExtractionReceipt } from './extraction-state';
import { logToRenderer } from '../lib/renderer-log';
import { makeImportReporter } from '../lib/import-progress';
import { extractAllItemSprites } from '@rotp/asset-extraction/node';
import { SPRITE_DEFINITIONS } from '@rotp/game-data';

const spriteDir = (romFile: string): string => {
  const stem = basename(romFile, extname(romFile));
  return getUserDataPath('sprites', stem);
};

const registerSpriteHandlers = (): void => {
  handle('sprites:extract', async (_event, romFile: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    const outDir = spriteDir(romFile);
    const report = makeImportReporter('sprite', basename(romFile, extname(romFile)));

    const buildCarriesNoDefinitions = SPRITE_DEFINITIONS.length === 0;
    if (buildCarriesNoDefinitions) {
      const msg = 'This build carries no sprite definitions, so there is nothing to extract.';
      logToRenderer('error', 'error', `Sprite extraction failed: ${msg}`);
      report('error', undefined, undefined, msg);
      return { success: false, error: msg };
    }

    try {
      await access(localRomPath);
    } catch {
      report('error', undefined, undefined, `ROM file not found: ${romFile}`);
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    await mkdir(outDir, { recursive: true });

    logToRenderer('app', 'info', `Extracting sprites from ${romFile}...`);
    report('decode', undefined, undefined, 'Extracting sprites...');

    try {
      const result = extractAllItemSprites(localRomPath, outDir, SPRITE_DEFINITIONS as never);
      if (result.errors.length > 0) {
        for (const err of result.errors) {
          logToRenderer('core', 'error', err);
        }
      }
      logToRenderer('app', 'info', `Sprites extracted: ${result.total} files (${result.counts.hud} HUD, ${result.counts.receipt} receipt, ${result.counts.drop} drop, ${result.counts.ground} ground)`);
      if (result.removedStale > 0) {
        logToRenderer('app', 'info', `Removed ${result.removedStale} stale sprite files`);
      }
      await writeExtractionReceipt(outDir);
      report('done');
      return { success: true, count: result.total };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logToRenderer('error', 'error', `Sprite extraction failed: ${msg}`);
      report('error', undefined, undefined, msg);
      return { success: false, error: msg };
    }
  });

  handle('sprites:check', async (_e, romFile: string) => checkExtraction(spriteDir(romFile)));

  handle('sprites:delete', async (_e, romFile: string) => {
    const outDir = spriteDir(romFile);
    try {
      await rm(outDir, { recursive: true, force: true });
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  });

  handle('sprites:getPath', async (_e, romFile: string, file: string) => {
    return join(spriteDir(romFile), `${file}.png`);
  });

  handle('spriteDebug:load', () => readJsonFile(getUserDataPath('sprite-debug.json'), {}));
  handle('spriteDebug:save', (_e, data: unknown) =>
    writeJsonFile(getUserDataPath('sprite-debug.json'), data));

  handle('spriteReview:load', () => readJsonFile(getUserDataPath('sprite-review.json'), {}));
  handle('spriteReview:save', (_e, data: unknown) =>
    writeJsonFile(getUserDataPath('sprite-review.json'), data));
};

export { registerSpriteHandlers };
