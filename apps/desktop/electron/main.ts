import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { join, basename } from 'path';
import { readFile, mkdir, writeFile, access, copyFile, rm, stat } from 'fs/promises';
import { spawn } from 'child_process';
import { is } from '@electron-toolkit/utils';

// Ensure consistent userData path across dev and production
app.setName('alttp-pc');

let mainWindow: BrowserWindow | null = null;

function getUserDataPath(...segments: string[]): string {
  return join(app.getPath('userData'), ...segments);
}

async function ensureDirectories(): Promise<void> {
  const dirs = ['assets', 'roms', 'saves', 'config', 'seeds'];
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

  // Check if a ROM is stored in userData (returns filename or null)
  ipcMain.handle('rom:check', async () => {
    try {
      const settings = await loadSettings();
      const romFile = settings.romFile as string | undefined;
      if (!romFile) return null;
      const s = await stat(getUserDataPath('roms', romFile));
      return s.size > 0 ? romFile : null;
    } catch {
      return null;
    }
  });

  // Extract assets from ROM using restool.py
  // Copies ROM to userData, runs extraction, stores result in userData,
  // cleans up any temp files written to the zelda3 submodule.
  ipcMain.handle('assets:extract', async (_event, romPath: string) => {
    // __dirname = dist/electron/ in both dev and prod (electron-vite)
    const projectRoot = join(__dirname, '..', '..');
    const zelda3Root = join(projectRoot, 'core', 'zelda3');
    const restoolPath = join(zelda3Root, 'assets', 'restool.py');
    const romFileName = basename(romPath);
    const localRomPath = getUserDataPath('roms', romFileName);
    const cachedAssetsPath = getUserDataPath('assets', 'zelda3_assets.dat');

    // restool writes output relative to zelda3 submodule (hardcoded paths)
    const submoduleOutputPath = join(zelda3Root, 'zelda3_assets.dat');
    const submoduleTablesPath = join(zelda3Root, 'tables');

    // Check restool.py exists
    try {
      await access(restoolPath);
    } catch {
      return { success: false, error: 'restool.py not found. zelda3 submodule may be missing.' };
    }

    const sendLog = (channel: string, level: string, message: string) => {
      mainWindow?.webContents.send('log:entry', { channel, level, message });
    };

    // Copy ROM to userData
    try {
      sendLog('app', 'info', 'Copying ROM to app data...');
      await copyFile(romPath, localRomPath);
      const romStat = await stat(localRomPath);
      sendLog('app', 'info', `ROM stored as ${romFileName} (${(romStat.size / 1024).toFixed(0)} KB)`);

      // Save the ROM filename in settings for future reference
      const settings = await loadSettings();
      settings.romFile = romFileName;
      await saveSettings(settings);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendLog('error', 'error', `Failed to copy ROM: ${msg}`);
      return { success: false, error: msg };
    }

    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      sendLog('app', 'info', 'Extracting assets from ROM...');

      const proc = spawn('python', ['-u', restoolPath, '--extract-from-rom', '-r', localRomPath], {
        cwd: join(zelda3Root, 'assets'),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        for (const line of data.toString().split('\n')) {
          if (line.trim()) sendLog('core', 'info', line.trim());
        }
      });

      proc.stderr.on('data', (data: Buffer) => {
        const text = data.toString();
        stderr += text;
        for (const line of text.split('\n')) {
          if (line.trim()) sendLog('core', 'error', line.trim());
        }
      });

      proc.on('error', (err) => {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          sendLog('error', 'error', 'Python not found. Install Python 3.11+ and ensure it is on PATH.');
          resolve({ success: false, error: 'Python not found on PATH' });
        } else {
          sendLog('error', 'error', `Failed to start extraction: ${err.message}`);
          resolve({ success: false, error: err.message });
        }
      });

      proc.on('close', async (code) => {
        if (code !== 0) {
          sendLog('error', 'error', `Extraction failed (exit code ${code})`);
          resolve({ success: false, error: stderr || `Exit code ${code}` });
          return;
        }

        // Move output from zelda3 submodule to userData, then clean up
        try {
          await access(submoduleOutputPath);
          await copyFile(submoduleOutputPath, cachedAssetsPath);
          const assetsStat = await stat(cachedAssetsPath);
          sendLog('app', 'info', `Assets cached (${(assetsStat.size / 1024).toFixed(0)} KB)`);

          // Clean up: remove generated files from zelda3 submodule
          await rm(submoduleOutputPath, { force: true });
          await rm(submoduleTablesPath, { recursive: true, force: true });
          sendLog('app', 'info', 'Cleaned up temporary extraction files');

          resolve({ success: true });
        } catch {
          sendLog('error', 'error', 'Extraction completed but zelda3_assets.dat not found');
          resolve({ success: false, error: 'Output file not found after extraction' });
        }
      });
    });
  });
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
