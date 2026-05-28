import { ipcMain } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';

function registerConnectionHandlers(): void {
  ipcMain.handle('connectionReview:load', async () => {
    try {
      const data = await readFile(getUserDataPath('connection-review.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });

  ipcMain.handle('connectionReview:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('connection-review.json'), JSON.stringify(data, null, 2), 'utf-8');
  });

  // Nav review data (per-screen connection point reviews with comments)
  ipcMain.handle('navReview:load', async () => {
    try {
      const data = await readFile(getUserDataPath('nav-review.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });

  ipcMain.handle('navReview:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('nav-review.json'), JSON.stringify(data, null, 2), 'utf-8');
  });
}

export { registerConnectionHandlers };
