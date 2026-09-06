/* @layer electron-main @kind logic */
/**
 * Test automation IPC handlers.
 *
 * CLI args consumed by the renderer:
 *   --auto-state=N    Load quick-save slot N after game starts
 *   --auto-state=NAME Load the MANUAL (normal) save called NAME. Names are stable
 *                     and quick-save can never overwrite them, so automation and
 *                     regression baselines pin to a name instead of a slot index
 *   --screenshot=NAME Capture window to tests/screenshots/{NAME}.png after state load
 *
 * The renderer calls these IPC channels:
 *   test:getArgs       → returns { autoState: number | string | null, screenshot: string | null }
 *   test:screenshot    → captures BrowserWindow to the given path, returns path
 */

import { BrowserWindow, app } from 'electron';
import { join } from 'path';
import { handle } from '../lib/ipc/handle';
import { writeFile, mkdir } from 'fs/promises';

const parseTestArgs = (): { autoState: number | string | null; screenshot: string | null } => {
  let autoState: number | string | null = null;
  let screenshot: string | null = null;

  for (const arg of process.argv) {
    // All-digits stays a quick-save slot (unchanged); anything else is a
    // manual-save name.
    const stateMatch = arg.match(/^--auto-state=(.+)$/);
    if (stateMatch) {
      const raw = stateMatch[1];
      autoState = /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
    }

    const ssMatch = arg.match(/^--screenshot=(.+)$/);
    if (ssMatch) screenshot = ssMatch[1];
  }

  return { autoState, screenshot };
};

const registerTestHandlers = (): void => {
  handle('test:getArgs', () => parseTestArgs());

  handle('test:screenshot', async (_event, name: string) => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    if (!win) throw new Error('No window available for screenshot');

    const image = await win.webContents.capturePage();
    const buffer = image.toPNG();

    // Resolve to the project root's tests/screenshots/, which works in dev and prod
    const appRoot = app.isPackaged
      ? join(app.getAppPath(), '../..')
      : join(__dirname, '../..');
    const dir = join(appRoot, 'tests', 'screenshots');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, `${name}.png`);
    await writeFile(outPath, buffer);
    return outPath;
  });
};

export { registerTestHandlers };
