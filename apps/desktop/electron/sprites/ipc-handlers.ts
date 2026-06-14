/* @layer electron-main @kind logic */
import { join, basename, extname } from 'path';
import { handle } from '../lib/ipc/handle';
import { readdir, mkdir, access, rm } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';
import { logToRenderer } from '../lib/renderer-log';
import { makeImportReporter } from '../lib/import-progress';
import { extractAllItemSprites } from '@shared/asset-extraction/item-sprites/extract-items-node';
import spriteDefinitions from '@shared/game/sprites/definitions.json';

const spriteDir = (romFile: string): string => {
  const stem = basename(romFile, extname(romFile));
  return getUserDataPath('sprites', stem);
};

const registerSpriteHandlers = (): void => {
  handle('sprites:extract', async (_event, romFile: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    const outDir = spriteDir(romFile);
    const report = makeImportReporter('sprite', basename(romFile, extname(romFile)));

    try {
      await access(localRomPath);
    } catch {
      report('error', undefined, undefined, `ROM file not found: ${romFile}`);
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    await mkdir(outDir, { recursive: true });

    logToRenderer('app', 'info', `Extracting sprites from ${romFile}...`);
    // Extraction is synchronous and fast — report an indeterminate "decode" phase.
    report('decode', undefined, undefined, 'Extracting sprites…');

    try {
      const result = extractAllItemSprites(localRomPath, outDir, spriteDefinitions.sprites as never);
      if (result.errors.length > 0) {
        for (const err of result.errors) {
          logToRenderer('core', 'error', err);
        }
      }
      logToRenderer('app', 'info', `Sprites extracted: ${result.total} files (${result.counts.hud} HUD, ${result.counts.receipt} receipt, ${result.counts.drop} drop)`);
      if (result.removedStale > 0) {
        logToRenderer('app', 'info', `Removed ${result.removedStale} stale sprite files`);
      }
      report('done');
      return { success: true, count: result.total };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logToRenderer('error', 'error', `Sprite extraction failed: ${msg}`);
      report('error', undefined, undefined, msg);
      return { success: false, error: msg };
    }
  });

  handle('sprites:check', async (_e, romFile: string) => {
    const outDir = spriteDir(romFile);
    try {
      const files = await readdir(outDir);
      const pngCount = files.filter(f => f.endsWith('.png')).length;
      return { extracted: pngCount > 0, count: pngCount };
    } catch {
      return { extracted: false, count: 0 };
    }
  });

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

  // Sprite debug data
  handle('spriteDebug:load', () => readJson(getUserDataPath('sprite-debug.json'), {}));
  handle('spriteDebug:save', (_e, data: unknown) =>
    writeJson(getUserDataPath('sprite-debug.json'), data));

  // Sprite review data
  handle('spriteReview:load', () => readJson(getUserDataPath('sprite-review.json'), {}));
  handle('spriteReview:save', (_e, data: unknown) =>
    writeJson(getUserDataPath('sprite-review.json'), data));
};

export { registerSpriteHandlers };
