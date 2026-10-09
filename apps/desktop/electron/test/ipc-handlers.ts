/* @layer electron-main @kind logic */
import { BrowserWindow, app } from 'electron';
import { join } from 'path';
import { handle } from '../lib/ipc/handle';
import { writeFile, mkdir } from 'fs/promises';

const parseTestArgs = (): { autoState: number | string | null; screenshot: string | null } => {
  let autoState: number | string | null = null;
  let screenshot: string | null = null;

  for (const arg of process.argv) {
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
