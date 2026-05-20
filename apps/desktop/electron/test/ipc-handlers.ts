/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  THIS TEST MUST NEVER BE MODIFIED BY THE AI             ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Test automation IPC handlers.
 *
 * CLI args consumed by the renderer:
 *   --auto-state=N    Load save state slot N after game starts
 *   --screenshot=NAME Capture window to tests/screenshots/{NAME}.png after state load
 *
 * The renderer calls these IPC channels:
 *   test:getArgs       → returns { autoState: number | null, screenshot: string | null }
 *   test:screenshot    → captures BrowserWindow to the given path, returns path
 */

import { ipcMain, BrowserWindow, app } from 'electron';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

function parseTestArgs(): { autoState: number | null; screenshot: string | null } {
  let autoState: number | null = null;
  let screenshot: string | null = null;

  for (const arg of process.argv) {
    const stateMatch = arg.match(/^--auto-state=(\d+)$/);
    if (stateMatch) autoState = parseInt(stateMatch[1], 10);

    const ssMatch = arg.match(/^--screenshot=(.+)$/);
    if (ssMatch) screenshot = ssMatch[1];
  }

  return { autoState, screenshot };
}

function registerTestHandlers(): void {
  ipcMain.handle('test:getArgs', () => parseTestArgs());

  ipcMain.handle('test:screenshot', async (_event, name: string) => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    if (!win) throw new Error('No window available for screenshot');

    const image = await win.webContents.capturePage();
    const buffer = image.toPNG();

    // Resolve to project root's tests/screenshots/ — works in both dev and prod
    const appRoot = app.isPackaged
      ? join(app.getAppPath(), '../..')
      : join(__dirname, '../..');
    const dir = join(appRoot, 'tests', 'screenshots');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, `${name}.png`);
    await writeFile(outPath, buffer);
    return outPath;
  });
}

export { registerTestHandlers };
