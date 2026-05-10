import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { readFile, mkdir, writeFile, access } from 'fs/promises';
import { is } from '@electron-toolkit/utils';

let mainWindow: BrowserWindow | null = null;

function getUserDataPath(...segments: string[]): string {
  return join(app.getPath('userData'), ...segments);
}

async function ensureDirectories(): Promise<void> {
  const dirs = ['assets', 'saves', 'config', 'seeds'];
  for (const dir of dirs) {
    await mkdir(getUserDataPath(dir), { recursive: true });
  }
}

async function loadSettings(): Promise<Record<string, unknown>> {
  try {
    const data = await readFile(getUserDataPath('config', 'settings.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveSettings(settings: Record<string, unknown>): Promise<void> {
  await writeFile(
    getUserDataPath('config', 'settings.json'),
    JSON.stringify(settings, null, 2),
    'utf-8',
  );
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    title: 'ALttP Randomizer',
    backgroundColor: '#16213e',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function registerIpcHandlers(): void {
  // Window controls
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());

  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);

  // File dialog — open ROM
  ipcMain.handle('dialog:openRom', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Select Zelda 3 ROM',
      filters: [
        { name: 'SNES ROM', extensions: ['sfc', 'smc'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  // Read a file as binary
  ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
    const data = await readFile(filePath);
    return data.buffer;
  });

  // Check if assets exist
  ipcMain.handle('assets:check', async () => {
    try {
      await access(getUserDataPath('assets', 'zelda3_assets.dat'));
      return true;
    } catch {
      return false;
    }
  });

  // Read assets file
  ipcMain.handle('assets:load', async () => {
    try {
      const data = await readFile(getUserDataPath('assets', 'zelda3_assets.dat'));
      return data.buffer;
    } catch {
      return null;
    }
  });

  // Save assets file
  ipcMain.handle('assets:save', async (_event, buffer: ArrayBuffer) => {
    await writeFile(getUserDataPath('assets', 'zelda3_assets.dat'), Buffer.from(buffer));
    return true;
  });

  // Settings
  ipcMain.handle('settings:load', () => loadSettings());
  ipcMain.handle('settings:save', (_event, settings: Record<string, unknown>) =>
    saveSettings(settings),
  );

  // Get userData path
  ipcMain.handle('app:getUserDataPath', () => app.getPath('userData'));
}

app.whenReady().then(async () => {
  await ensureDirectories();
  registerIpcHandlers();
  createWindow();

  // Forward maximize/unmaximize events to renderer
  mainWindow!.on('maximize', () => mainWindow?.webContents.send('window:maximized', true));
  mainWindow!.on('unmaximize', () => mainWindow?.webContents.send('window:maximized', false));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
