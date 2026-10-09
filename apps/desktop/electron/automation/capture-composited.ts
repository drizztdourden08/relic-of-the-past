/* @layer electron-main @kind logic */
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { BrowserWindow } from 'electron';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { assertSafeName } from '@drizztdourden08/brock-core/storage';

const captureComposited = async (win: BrowserWindow, name: string): Promise<string> => {
  const { debugger: devtools } = win.webContents;
  const attached = devtools.isAttached();
  if (!attached) devtools.attach('1.3');
  try {
    const shot = (await devtools.sendCommand('Page.captureScreenshot', { format: 'png' })) as { data: string };
    const dir = getUserDataPath('screenshots');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, `${assertSafeName(name, 'screenshot name')}.png`);
    await writeFile(outPath, Buffer.from(shot.data, 'base64'));
    return outPath;
  } finally {
    if (!attached) devtools.detach();
  }
};

export { captureComposited };
