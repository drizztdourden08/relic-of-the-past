import { app, BrowserWindow, shell, ipcMain, dialog, net } from 'electron';
import { join, basename, extname } from 'path';
import { readFile, mkdir, writeFile, access, copyFile, rm, stat, readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { spawn } from 'child_process';
import { pipeline } from 'stream/promises';
import { is } from '@electron-toolkit/utils';
import {
  initProfileManager,
  loadAppState,
  saveAppState,
  listProfiles,
  createProfile,
  loadProfile,
  updateProfile,
  deleteProfile,
  listRoms,
  hasAssetForRom,
  getAssetFileName,
  writeSramFile,
  readSramFile,
  writeStateFile,
  readStateFile,
  listStateFiles,
  writeStateScreenshot,
  readStateScreenshot,
  getStateSlotInfos,
  readConfig,
  writeConfig,
  listSessions,
  saveSession,
} from './profile-manager';

// Ensure consistent userData path across dev and production
app.setName('alttp-pc');

let mainWindow: BrowserWindow | null = null;

function getUserDataPath(...segments: string[]): string {
  return join(app.getPath('userData'), ...segments);
}

async function ensureDirectories(): Promise<void> {
  const dirs = ['assets', 'roms', 'profiles', 'config'];
  for (const dir of dirs) {
    await mkdir(getUserDataPath(dir), { recursive: true });
  }
}

function createWindow(): void {
  const noFocus = process.argv.includes('--no-focus');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 360,
    minHeight: 280,
    frame: false,
    titleBarStyle: 'hidden',
    title: 'ALttP Randomizer',
    backgroundColor: '#16213e',
    show: !noFocus,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (noFocus) {
    mainWindow.showInactive();
  }

  // Prevent Electron from capturing F1-F4 keys so they pass through to the
  // game canvas for save/load states. F5+ and F12 are left alone.
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && /^F[1-4]$/.test(input.key)) {
      _event.preventDefault();
    }
  });

  if (process.argv.includes('--muted')) {
    mainWindow.webContents.setAudioMuted(true);
  }

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
  ipcMain.handle('window:setAlwaysOnTop', (_event, value: boolean) => {
    mainWindow?.setAlwaysOnTop(value);
    return mainWindow?.isAlwaysOnTop() ?? false;
  });
  ipcMain.handle('window:setAudioMuted', (_event, value: boolean) => {
    mainWindow?.webContents.setAudioMuted(value);
    return mainWindow?.webContents.isAudioMuted() ?? false;
  });
  ipcMain.handle('window:isAudioMuted', () => mainWindow?.webContents.isAudioMuted() ?? false);

  ipcMain.on('window:toggleFullscreen', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });
  ipcMain.on('window:setFullscreen', (_e, value: boolean) => {
    if (mainWindow) {
      mainWindow.setFullScreen(value);
    }
  });
  ipcMain.handle('window:isFullscreen', () => mainWindow?.isFullScreen() ?? false);

  // Aspect ratio lock — snap window to correct size and enforce on user resize
  // Note: Electron's extraSize parameter for setAspectRatio is broken on Windows,
  // so we use will-resize to manually enforce the correct content ratio.
  let lockedRatio = 0;
  let lockedExtraHeight = 0;

  ipcMain.on('window:setAspectRatioLock', (_e, ratio: number, extraHeight: number) => {
    if (!mainWindow) return;
    lockedRatio = ratio;
    lockedExtraHeight = extraHeight;

    if (ratio <= 0) {
      mainWindow.setAspectRatio(0);
      return;
    }

    // Snap: shrink the window to fit the ratio. Never grow.
    const [w, h] = mainWindow.getSize();
    const contentH = h - extraHeight;
    const wForH = Math.round(contentH * ratio);   // width that fits current height
    const hForW = Math.round(w / ratio) + extraHeight; // height that fits current width

    // Pick whichever dimension needs shrinking. Never increase either dimension.
    if (wForH <= w) {
      mainWindow.setSize(wForH, h);
      // Verify we didn't grow (minWidth clamp)
      const [aw] = mainWindow.getSize();
      if (aw > w) mainWindow.setSize(w, h); // revert
    } else if (hForW <= h) {
      mainWindow.setSize(w, hForW);
      // Verify we didn't grow (minHeight clamp)
      const [, ah] = mainWindow.getSize();
      if (ah > h) mainWindow.setSize(w, h); // revert
    }
    // else: both would grow — leave window unchanged, accept some black bars

    // Don't call setAspectRatio — it's broken with extraSize on Windows.
    // We enforce entirely via will-resize below.
  });

  // Manual enforcement with will-resize to correctly handle the titlebar offset.
  // Uses the drag edge to decide behavior:
  //   - Side drags (left/right/bottom): the dragged axis is the user's intent,
  //     compute the other axis freely (it may grow or shrink).
  //   - Corner drags: fit within proposed bounds, never exceed either dimension.
  app.on('browser-window-created', (_event, win) => {
    win.on('will-resize', (e, newBounds, details) => {
      if (lockedRatio <= 0) return;

      const edge = details?.edge ?? '';
      const isSideH = edge === 'left' || edge === 'right';
      const isSideV = edge === 'bottom' || edge === 'top';

      let targetW: number;
      let targetH: number;

      if (isSideH) {
        // User is changing width — compute height to match
        targetW = newBounds.width;
        targetH = Math.round(newBounds.width / lockedRatio) + lockedExtraHeight;
      } else if (isSideV) {
        // User is changing height — compute width to match
        const contentH = newBounds.height - lockedExtraHeight;
        targetW = Math.round(contentH * lockedRatio);
        targetH = newBounds.height;
      } else {
        // Corner drag — fit within proposed bounds, never exceed either dimension
        const contentH = newBounds.height - lockedExtraHeight;
        const wForH = Math.round(contentH * lockedRatio);
        const hForW = Math.round(newBounds.width / lockedRatio) + lockedExtraHeight;

        if (wForH <= newBounds.width && hForW <= newBounds.height) {
          // Both directions can shrink — pick larger area
          const areaW = wForH * newBounds.height;
          const areaH = newBounds.width * hForW;
          if (areaW >= areaH) {
            targetW = wForH;
            targetH = newBounds.height;
          } else {
            targetW = newBounds.width;
            targetH = hForW;
          }
        } else if (wForH <= newBounds.width) {
          targetW = wForH;
          targetH = newBounds.height;
        } else if (hForW <= newBounds.height) {
          targetW = newBounds.width;
          targetH = hForW;
        } else {
          e.preventDefault();
          return;
        }
      }

      if (targetW !== newBounds.width || targetH !== newBounds.height) {
        e.preventDefault();
        // Anchor the edge opposite to the drag so the window doesn't jump.
        // Use the CURRENT window bounds to find the fixed anchor point.
        const cur = win.getBounds();
        let x = newBounds.x;
        let y = newBounds.y;
        if (edge.includes('left')) {
          // Right edge is the anchor: currentRight = cur.x + cur.width
          x = (cur.x + cur.width) - targetW;
        }
        if (edge.includes('top')) {
          // Bottom edge is the anchor: currentBottom = cur.y + cur.height
          y = (cur.y + cur.height) - targetH;
        }
        win.setBounds({ x, y, width: targetW, height: targetH });
      }
    });
  });

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

  // ─── Profile management ───

  ipcMain.handle('profiles:list', () => listProfiles());

  ipcMain.handle('profiles:create', async (_event, name: string, romFile: string) => {
    const profile = await createProfile(name, romFile);
    const appState = await loadAppState();
    appState.lastProfileId = profile.id;
    await saveAppState(appState);
    return profile;
  });

  ipcMain.handle('profiles:delete', async (_event, id: string) => {
    await deleteProfile(id);
    const appState = await loadAppState();
    if (appState.lastProfileId === id) {
      appState.lastProfileId = null;
      await saveAppState(appState);
    }
  });

  ipcMain.handle('profiles:setLast', async (_event, id: string) => {
    const appState = await loadAppState();
    appState.lastProfileId = id;
    await saveAppState(appState);
  });

  ipcMain.handle('profiles:getAppState', () => loadAppState());

  ipcMain.handle('profiles:updateLastPlayed', async (_event, id: string) => {
    const profile = await loadProfile(id);
    if (profile) {
      profile.lastPlayed = Date.now();
      await updateProfile(profile);
    }
  });

  // ─── ROM management ───

  ipcMain.handle('roms:list', () => listRoms());

  ipcMain.handle('roms:listWithStatus', async () => {
    const romFiles = await listRoms();
    const results = [];
    for (const romFile of romFiles) {
      const hasAssets = await hasAssetForRom(romFile);
      let assetSize: number | null = null;
      if (hasAssets) {
        try {
          const assetFile = getAssetFileName(romFile);
          const s = await stat(getUserDataPath('assets', assetFile));
          assetSize = s.size;
        } catch { /* ignore */ }
      }
      results.push({ romFile, hasAssets, assetSize });
    }
    return results;
  });

  ipcMain.handle('roms:import', async (_event, romPath: string) => {
    const romFileName = basename(romPath);
    const localRomPath = getUserDataPath('roms', romFileName);

    // Check if already imported
    try {
      await access(localRomPath);
      return { success: true, romFile: romFileName, alreadyExists: true };
    } catch {
      // Not imported yet
    }

    try {
      await copyFile(romPath, localRomPath);
      return { success: true, romFile: romFileName, alreadyExists: false };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg, romFile: romFileName };
    }
  });

  ipcMain.handle('roms:delete', async (_event, romFile: string) => {
    const romPath = getUserDataPath('roms', romFile);
    const assetFile = getAssetFileName(romFile);
    const assetPath = getUserDataPath('assets', assetFile);

    // Delete ROM file
    await rm(romPath, { force: true });
    // Delete cached assets if they exist
    await rm(assetPath, { force: true });

    // Delete any profiles that reference this ROM
    const profiles = await listProfiles();
    for (const p of profiles) {
      if (p.romFile === romFile) {
        await deleteProfile(p.id);
      }
    }

    // Clear lastProfileId if it pointed to a deleted profile
    const appState = await loadAppState();
    const remaining = await listProfiles();
    if (appState.lastProfileId && !remaining.find((p) => p.id === appState.lastProfileId)) {
      appState.lastProfileId = null;
      await saveAppState(appState);
    }
  });

  // ─── Asset extraction (per-ROM) ───

  ipcMain.handle('assets:check', async (_event, romFile: string) => {
    return hasAssetForRom(romFile);
  });

  ipcMain.handle('assets:load', async (_event, romFile: string) => {
    const assetFile = getAssetFileName(romFile);
    try {
      const data = await readFile(getUserDataPath('assets', assetFile));
      return data.buffer;
    } catch {
      return null;
    }
  });

  ipcMain.handle('assets:extract', async (_event, romFile: string) => {
    const projectRoot = join(__dirname, '..', '..');
    const zelda3Root = join(projectRoot, 'core', 'zelda3');
    const restoolPath = join(zelda3Root, 'assets', 'restool.py');
    const localRomPath = getUserDataPath('roms', romFile);
    const assetFile = getAssetFileName(romFile);
    const cachedAssetsPath = getUserDataPath('assets', assetFile);

    const submoduleOutputPath = join(zelda3Root, 'zelda3_assets.dat');
    const submoduleTablesPath = join(zelda3Root, 'tables');

    try {
      await access(restoolPath);
    } catch {
      return { success: false, error: 'restool.py not found. zelda3 submodule may be missing.' };
    }

    try {
      await access(localRomPath);
    } catch {
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    const sendLog = (channel: string, level: string, message: string) => {
      mainWindow?.webContents.send('log:entry', { channel, level, message });
    };

    sendLog('app', 'info', `Extracting assets from ${romFile}...`);

    return new Promise<{ success: boolean; error?: string }>((resolve) => {
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

        try {
          await access(submoduleOutputPath);
          await copyFile(submoduleOutputPath, cachedAssetsPath);
          const assetsStat = await stat(cachedAssetsPath);
          sendLog('app', 'info', `Assets cached as ${assetFile} (${(assetsStat.size / 1024).toFixed(0)} KB)`);

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

  // ─── Save file management ───

  ipcMain.handle('saves:writeSram', async (_event, profileId: string, data: ArrayBuffer) => {
    await writeSramFile(profileId, Buffer.from(data));
  });

  ipcMain.handle('saves:readSram', async (_event, profileId: string) => {
    const data = await readSramFile(profileId);
    return data ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
  });

  ipcMain.handle('saves:writeState', async (_event, profileId: string, slot: number, data: ArrayBuffer) => {
    await writeStateFile(profileId, slot, Buffer.from(data));
  });

  ipcMain.handle('saves:readState', async (_event, profileId: string, slot: number) => {
    const data = await readStateFile(profileId, slot);
    return data ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
  });

  ipcMain.handle('saves:listStates', async (_event, profileId: string) => {
    return listStateFiles(profileId);
  });

  ipcMain.handle('saves:writeScreenshot', async (_event, profileId: string, slot: number, data: ArrayBuffer) => {
    await writeStateScreenshot(profileId, slot, Buffer.from(data));
  });

  ipcMain.handle('saves:readScreenshot', async (_event, profileId: string, slot: number) => {
    const data = await readStateScreenshot(profileId, slot);
    return data ? data.toString('base64') : null;
  });

  ipcMain.handle('saves:getSlotInfos', async (_event, profileId: string) => {
    return getStateSlotInfos(profileId);
  });

  // Config (per-profile settings)
  ipcMain.handle('config:read', async (_event, profileId: string) => {
    return readConfig(profileId);
  });

  ipcMain.handle('config:write', async (_event, profileId: string, settings: unknown) => {
    await writeConfig(profileId, settings as any);
  });

  // ─── MSU import ───

  function getMsuDir(profileId: string): string {
    return getUserDataPath('profiles', profileId, 'msu');
  }

  const MSU_EXTENSIONS = new Set(['.pcm', '.opuz']);

  async function extractZipToMsu(zipPath: string, msuDir: string): Promise<number> {
    // Extract to a temp directory first, then move MSU files
    const tempDir = join(app.getPath('temp'), `msu-extract-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    try {
      // Use PowerShell Expand-Archive on Windows
      await new Promise<void>((resolve, reject) => {
        const ps = spawn('powershell', [
          '-NoProfile', '-Command',
          `Expand-Archive -Path '${zipPath}' -DestinationPath '${tempDir}' -Force`,
        ]);
        ps.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Expand-Archive exited with code ${code}`)));
        ps.on('error', reject);
      });

      // Find all MSU files recursively and copy to msuDir
      await mkdir(msuDir, { recursive: true });
      let count = 0;

      async function walkAndCopy(dir: string): Promise<void> {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            await walkAndCopy(fullPath);
          } else if (MSU_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
            await copyFile(fullPath, join(msuDir, entry.name));
            count++;
          }
        }
      }

      await walkAndCopy(tempDir);
      return count;
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  ipcMain.handle('msu:import', async (_event, profileId: string, url: string) => {
    try {
      // Validate URL
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { success: false, error: 'Only HTTP/HTTPS URLs are supported' };
      }

      const msuDir = getMsuDir(profileId);
      const tempFile = join(app.getPath('temp'), `msu-download-${Date.now()}.zip`);

      // Download using Electron's net module (follows redirects)
      const response = await net.fetch(url);
      if (!response.ok) {
        return { success: false, error: `Download failed: HTTP ${response.status}` };
      }

      // Stream response body to temp file
      const body = response.body;
      if (!body) {
        return { success: false, error: 'Empty response body' };
      }
      const fileStream = createWriteStream(tempFile);
      // @ts-expect-error - Node/Electron stream compatibility
      await pipeline(body, fileStream);

      try {
        const fileCount = await extractZipToMsu(tempFile, msuDir);
        return { success: true, fileCount };
      } finally {
        await rm(tempFile, { force: true }).catch(() => {});
      }
    } catch (e) {
      return { success: false, error: `${e instanceof Error ? e.message : e}` };
    }
  });

  ipcMain.handle('msu:importFile', async (_event, profileId: string, filePath: string) => {
    try {
      const msuDir = getMsuDir(profileId);
      const ext = extname(filePath).toLowerCase();

      if (ext === '.zip') {
        const fileCount = await extractZipToMsu(filePath, msuDir);
        return { success: true, fileCount };
      } else if (MSU_EXTENSIONS.has(ext)) {
        // Single MSU file — copy directly
        await mkdir(msuDir, { recursive: true });
        await copyFile(filePath, join(msuDir, basename(filePath)));
        return { success: true, fileCount: 1 };
      } else {
        return { success: false, error: 'Unsupported file type. Use .zip, .pcm, or .opuz files.' };
      }
    } catch (e) {
      return { success: false, error: `${e instanceof Error ? e.message : e}` };
    }
  });

  // Play sessions
  ipcMain.handle('sessions:list', async (_event, profileId: string) => {
    return listSessions(profileId);
  });

  ipcMain.handle('sessions:save', async (_event, profileId: string, session: unknown) => {
    await saveSession(profileId, session as any);
  });

  // Get userData path
  ipcMain.handle('app:getUserDataPath', () => app.getPath('userData'));
}

app.whenReady().then(async () => {
  initProfileManager(app.getPath('userData'));
  await ensureDirectories();
  registerIpcHandlers();
  createWindow();

  // Forward maximize/unmaximize events to renderer
  mainWindow!.on('maximize', () => mainWindow?.webContents.send('window:maximized', true));
  mainWindow!.on('unmaximize', () => mainWindow?.webContents.send('window:maximized', false));

  // Forward fullscreen events to renderer
  mainWindow!.on('enter-full-screen', () => mainWindow?.webContents.send('window:fullscreen', true));
  mainWindow!.on('leave-full-screen', () => mainWindow?.webContents.send('window:fullscreen', false));

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
