/* @layer electron-main @kind logic */
/**
 * Debug CLI: --dump-nav=N|NAME
 *
 * Loads a save state — a number is a quick-save slot, a string is a MANUAL
 * (normal) save's name — dumps navigation widget state (entrances, screen
 * detection, transitions) to debug-output/dump-nav.json, then exits.
 *
 * Usage:
 *   npx electron dist/electron/main.js --muted --dump-nav=1
 *   npx electron dist/electron/main.js --muted --dump-nav=test-throne-room
 */

import { app } from 'electron';
import { join } from 'path';
import { handle } from '../lib/ipc/handle';
import { writeFile, mkdir } from 'fs/promises';

const parseDumpNavSlot = (): number | string | null => {
  for (const arg of process.argv) {
    const match = arg.match(/^--dump-nav=(.+)$/);
    // All-digits stays a quick-save slot; anything else is a manual-save name.
    if (match) return /^\d+$/.test(match[1]) ? parseInt(match[1], 10) : match[1];
  }
  return null;
};

const registerDumpNavHandler = (): void => {
  const slot = parseDumpNavSlot();

  handle('debug:getDumpNavSlot', () => slot);

  handle('debug:dumpNav', async (_event, data: unknown) => {
    const appRoot = app.isPackaged
      ? join(app.getAppPath(), '../..')
      : join(__dirname, '../..');
    const dir = join(appRoot, 'debug-output');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, 'dump-nav.json');
    await writeFile(outPath, JSON.stringify(data, null, 2));
    console.log(`[dump-nav] Written to: ${outPath}`);
    return outPath;
  });
};

export { registerDumpNavHandler };
