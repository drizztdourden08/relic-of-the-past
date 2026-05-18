import { app, BrowserWindow, shell, ipcMain, dialog, net, Menu } from 'electron';
import { join, basename, extname } from 'path';
import { readFile, mkdir, writeFile, access, copyFile, rm, stat, readdir, rename } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import StreamZip from 'node-stream-zip';
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
  saveTrackerState,
  loadTrackerState,
  readInputProfiles,
  writeInputProfiles,
  readStickCalibration,
  writeStickCalibration,
  readTriggerCalibration,
  writeTriggerCalibration,
  ensureDataDirectories,
  migrateDataFolder,
} from './profile-manager';
import { enumerateControllers } from './hid-devices';
import { hidInputReader } from './hid-input-reader';
import { extractAllItemSprites } from '../../../shared/asset-extraction/item-sprites/extract-items';
import spriteDefinitions from '../../../shared/data/sprite-definitions.json';
import { loadRom } from '../../../shared/asset-extraction/rom/rom-loader';
import { compileResources } from '../../../shared/asset-extraction/compile-resources';
import { decodeStrings, formatDialogueText } from '../../../shared/asset-extraction/text/dialogue-decoder';

// Ensure consistent userData path across dev and production
app.setName('alttp-pc');

// Allow gamepad enumeration without requiring a button press first
app.commandLine.appendSwitch('disable-features', 'RestrictGamepadAccess');

let mainWindow: BrowserWindow | null = null;

function getUserDataPath(...segments: string[]): string {
  return join(app.getPath('userData'), 'Data', ...segments);
}

// ensureDirectories is now handled by profile-manager's ensureDataDirectories

function createWindow(): void {
  const noFocus = process.argv.includes('--no-focus');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 360,
    minHeight: 280,
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
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

  // Let F1-F12 (and Tab) pass through to the renderer instead of being
  // consumed by Electron menu accelerators.  setIgnoreMenuShortcuts
  // bypasses menu handling for the current keystroke while still
  // dispatching the DOM keydown event to the page.
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && (
      /^F([1-9]|1[0-2])$/.test(input.key) ||
      input.key === 'Tab'
    )) {
      mainWindow!.webContents.setIgnoreMenuShortcuts(true);
    } else {
      mainWindow!.webContents.setIgnoreMenuShortcuts(false);
    }
  });

  // Allow gamepad and other device permissions for the renderer
  mainWindow.webContents.session.setPermissionCheckHandler((_webContents, permission) => {
    return true;
  });
  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(true);
  });

  // Auto-select HID devices (bypass the picker dialog for WebHID)
  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    // Auto-select the first matching device
    if (details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  // Auto-select USB devices (bypass the picker dialog for WebUSB)
  mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
    event.preventDefault();
    const device = details.deviceList.find(
      (d) => d.vendorId === 0x057E
    );
    if (device) {
      callback(device.deviceId);
    } else if (details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback();
    }
  });

  // Grant permission to any HID/USB device
  mainWindow.webContents.session.setDevicePermissionHandler((_details) => {
    return true;
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
  ipcMain.on('window:openDevTools', () => mainWindow?.webContents.openDevTools());

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

  // ─── Shared archive / download helpers ───

  const ROM_EXTENSIONS = new Set(['.sfc', '.smc']);

  /** Extract a zip/archive to a temp directory using node-stream-zip and return the temp path. */
  async function extractArchiveToTemp(archivePath: string): Promise<string> {
    const tempDir = join(app.getPath('temp'), `archive-extract-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
    const zip = new StreamZip.async({ file: archivePath });
    try {
      await zip.extract(null, tempDir);
    } finally {
      await zip.close();
    }
    return tempDir;
  }

  /** Walk a directory recursively and return all files matching a set of extensions. */
  async function walkFiles(dir: string, extensions?: Set<string>): Promise<string[]> {
    const found: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        found.push(...await walkFiles(full, extensions));
      } else if (!extensions || extensions.has(extname(entry.name).toLowerCase())) {
        found.push(full);
      }
    }
    return found;
  }

  /** Download a URL to a temp file and return its path. */
  async function downloadToTemp(url: string, suffix = '.zip'): Promise<string> {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }
    const tempFile = join(app.getPath('temp'), `dl-${Date.now()}${suffix}`);
    const response = await net.fetch(url);
    if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
    const body = response.body;
    if (!body) throw new Error('Empty response body');
    const fileStream = createWriteStream(tempFile);
    // @ts-expect-error - Node/Electron stream compatibility
    await pipeline(body, fileStream);
    return tempFile;
  }

  // ─── Profile management ───

  ipcMain.handle('profiles:list', () => listProfiles());

  ipcMain.handle('profiles:create', async (_event, name: string, romFile: string, language?: string, msuPack?: string) => {
    const profile = await createProfile(name, romFile, language, msuPack);
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
    try {
      const ext = extname(romPath).toLowerCase();

      // If it's a direct ROM file, copy it
      if (ROM_EXTENSIONS.has(ext)) {
        const romFileName = basename(romPath);
        const localRomPath = getUserDataPath('roms', romFileName);
        try {
          await access(localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: true };
        } catch { /* not imported yet */ }
        await copyFile(romPath, localRomPath);
        return { success: true, romFile: romFileName, alreadyExists: false };
      }

      // Archive — extract and find ROM inside
      if (ext === '.zip' || ext === '.7z' || ext === '.rar') {
        const tempDir = await extractArchiveToTemp(romPath);
        try {
          const romFiles = await walkFiles(tempDir, ROM_EXTENSIONS);
          if (romFiles.length === 0) {
            return { success: false, error: 'No ROM file (.sfc/.smc) found inside the archive', romFile: '' };
          }
          if (romFiles.length > 1) {
            return { success: false, error: `Multiple ROM files found inside the archive (${romFiles.length}). Archives must contain exactly one ROM.`, romFile: '' };
          }
          const foundRom = romFiles[0];
          const romFileName = basename(foundRom);
          const localRomPath = getUserDataPath('roms', romFileName);
          try {
            await access(localRomPath);
            return { success: true, romFile: romFileName, alreadyExists: true };
          } catch { /* not imported yet */ }
          await copyFile(foundRom, localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: false };
        } finally {
          await rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
      }

      return { success: false, error: 'Unsupported file type. Use .sfc, .smc, .zip, .7z, or .rar files.', romFile: '' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg, romFile: '' };
    }
  });

  ipcMain.handle('roms:importUrl', async (_event, url: string) => {
    try {
      const tempFile = await downloadToTemp(url, '.zip');
      try {
        // Try to extract as archive first
        const tempDir = await extractArchiveToTemp(tempFile);
        try {
          const romFiles = await walkFiles(tempDir, ROM_EXTENSIONS);
          if (romFiles.length === 0) {
            return { success: false, error: 'No ROM file (.sfc/.smc) found in the downloaded archive', romFile: '' };
          }
          if (romFiles.length > 1) {
            return { success: false, error: `Multiple ROM files found (${romFiles.length}). Archives must contain exactly one ROM.`, romFile: '' };
          }
          const foundRom = romFiles[0];
          const romFileName = basename(foundRom);
          const localRomPath = getUserDataPath('roms', romFileName);
          try {
            await access(localRomPath);
            return { success: true, romFile: romFileName, alreadyExists: true };
          } catch { /* not imported yet */ }
          await copyFile(foundRom, localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: false };
        } finally {
          await rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
      } catch {
        // Not a valid archive — check if it's a raw ROM
        const s = await stat(tempFile);
        if (s.size > 0 && s.size <= 8 * 1024 * 1024) {
          // Guess filename from URL
          const urlPath = new URL(url).pathname;
          let romFileName = basename(urlPath);
          if (!ROM_EXTENSIONS.has(extname(romFileName).toLowerCase())) {
            romFileName = `rom-${Date.now()}.sfc`;
          }
          const localRomPath = getUserDataPath('roms', romFileName);
          await copyFile(tempFile, localRomPath);
          return { success: true, romFile: romFileName, alreadyExists: false };
        }
        return { success: false, error: 'Downloaded file is not a valid ROM or archive', romFile: '' };
      } finally {
        await rm(tempFile, { force: true }).catch(() => {});
      }
    } catch (err) {
      return { success: false, error: `${err instanceof Error ? err.message : err}`, romFile: '' };
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
    const localRomPath = getUserDataPath('roms', romFile);
    const assetFile = getAssetFileName(romFile);
    const cachedAssetsPath = getUserDataPath('assets', assetFile);

    try {
      await access(localRomPath);
    } catch {
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    const sendLog = (channel: string, level: string, message: string) => {
      mainWindow?.webContents.send('log:entry', { channel, level, message });
    };

    sendLog('app', 'info', `Compiling assets from ${romFile}...`);

    try {
      const rom = loadRom(localRomPath);
      sendLog('core', 'info', `ROM loaded: ${rom.language} (${rom.description})`);
      const dat = compileResources(rom);
      await writeFile(cachedAssetsPath, dat);
      sendLog('app', 'info', `Assets cached as ${assetFile} (${(dat.length / 1024).toFixed(0)} KB)`);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendLog('error', 'error', `Asset compilation failed: ${msg}`);
      return { success: false, error: msg };
    }
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

  function getMsuDir(packName: string): string {
    return getUserDataPath('msu', packName);
  }

  const MSU_EXTENSIONS = new Set(['.pcm', '.opuz', '.msu']);

  async function extractArchiveToMsu(archivePath: string, msuDir: string): Promise<number> {
    const tempDir = await extractArchiveToTemp(archivePath);
    try {
      await mkdir(msuDir, { recursive: true });
      const msuFiles = await walkFiles(tempDir, MSU_EXTENSIONS);
      for (const f of msuFiles) {
        await copyFile(f, join(msuDir, basename(f)));
      }
      return msuFiles.length;
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  ipcMain.handle('msu:import', async (_event, packName: string, url: string) => {
    let tempFile: string | undefined;
    try {
      tempFile = await downloadToTemp(url, '.zip');
      const msuDir = getMsuDir(packName);
      const fileCount = await extractArchiveToMsu(tempFile, msuDir);
      if (fileCount === 0) {
        await rm(msuDir, { recursive: true, force: true }).catch(() => {});
        return { success: false, error: 'No audio tracks (.pcm/.opuz/.msu) found in the archive. This may be a patch file, not an MSU audio pack.' };
      }
      return { success: true, fileCount };
    } catch (e) {
      return { success: false, error: `${e instanceof Error ? e.message : e}` };
    } finally {
      if (tempFile) await rm(tempFile, { force: true }).catch(() => {});
    }
  });

  ipcMain.handle('msu:importFile', async (_event, packName: string, filePath: string) => {
    try {
      const msuDir = getMsuDir(packName);
      const ext = extname(filePath).toLowerCase();

      if (ext === '.zip' || ext === '.7z' || ext === '.rar') {
        const fileCount = await extractArchiveToMsu(filePath, msuDir);
        if (fileCount === 0) {
          await rm(msuDir, { recursive: true, force: true }).catch(() => {});
          return { success: false, error: 'No audio tracks (.pcm/.opuz/.msu) found in the archive. This may be a patch file, not an MSU audio pack.' };
        }
        return { success: true, fileCount };
      } else if (MSU_EXTENSIONS.has(ext)) {
        await mkdir(msuDir, { recursive: true });
        await copyFile(filePath, join(msuDir, basename(filePath)));
        return { success: true, fileCount: 1 };
      } else {
        return { success: false, error: 'Unsupported file type. Use .zip, .7z, .rar, .pcm, or .opuz files.' };
      }
    } catch (e) {
      return { success: false, error: `${e instanceof Error ? e.message : e}` };
    }
  });

  // ─── MSU pack management ───

  ipcMain.handle('msu:listPacks', async () => {
    const msuDir = getUserDataPath('msu');
    try {
      const entries = await readdir(msuDir, { withFileTypes: true });
      const packs: { name: string; fileCount: number; totalSize: number }[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const packDir = join(msuDir, entry.name);
        const files = await readdir(packDir);
        const msuFiles = files.filter((f) => /\.(pcm|opuz|msu)$/i.test(f));
        let totalSize = 0;
        for (const f of msuFiles) {
          try { totalSize += (await stat(join(packDir, f))).size; } catch { /* skip */ }
        }
        packs.push({ name: entry.name, fileCount: msuFiles.length, totalSize });
      }
      return packs;
    } catch { return []; }
  });

  ipcMain.handle('msu:getPackFiles', async (_event, packName: string) => {
    const packDir = getUserDataPath('msu', packName);
    try {
      const files = await readdir(packDir);
      const results: { name: string; size: number }[] = [];
      for (const f of files) {
        if (/\.(pcm|opuz|msu)$/i.test(f)) {
          try {
            const s = await stat(join(packDir, f));
            results.push({ name: f, size: s.size });
          } catch { /* skip */ }
        }
      }
      return results;
    } catch { return []; }
  });

  ipcMain.handle('msu:deletePack', async (_event, packName: string) => {
    await rm(getUserDataPath('msu', packName), { recursive: true, force: true });
  });

  // ─── MSU game loading ───

  ipcMain.handle('msu:getTrackList', async (_event, packName: string) => {
    const packDir = getUserDataPath('msu', packName);
    try {
      const files = await readdir(packDir);
      const tracks: { fileName: string; trackNum: number; ext: string }[] = [];
      for (const f of files) {
        const match = f.match(/(\d+)\.(pcm|opuz)$/i);
        if (!match) continue;
        tracks.push({ fileName: f, trackNum: parseInt(match[1]), ext: match[2].toLowerCase() });
      }
      return tracks;
    } catch { return []; }
  });

  ipcMain.handle('msu:readTrackFile', async (_event, packName: string, fileName: string) => {
    // Security: prevent path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error('Invalid filename');
    }
    const filePath = join(getUserDataPath('msu', packName), fileName);
    const buf = await readFile(filePath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  });

  // ─── Language pack management ───

  ipcMain.handle('languages:list', async () => {
    const langDir = getUserDataPath('languages');
    try {
      const entries = await readdir(langDir, { withFileTypes: true });
      const langs: { code: string; fileCount: number }[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const dir = join(langDir, entry.name);
        const files = await readdir(dir);
        langs.push({ code: entry.name, fileCount: files.length });
      }
      return langs;
    } catch { return []; }
  });

  /** Helper: resolve a ROM file to a usable local path. Handles archives, returns temp path if needed. */
  async function resolveRomFile(filePath: string): Promise<{ romPath: string; tempDir?: string }> {
    const ext = extname(filePath).toLowerCase();
    if (ROM_EXTENSIONS.has(ext)) {
      return { romPath: filePath };
    }
    if (ext === '.zip' || ext === '.7z' || ext === '.rar') {
      const tempDir = await extractArchiveToTemp(filePath);
      const roms = await walkFiles(tempDir, ROM_EXTENSIONS);
      if (roms.length === 0) throw new Error('No ROM file (.sfc/.smc) found inside the archive');
      if (roms.length > 1) throw new Error(`Multiple ROM files found (${roms.length}). Use an archive with exactly one ROM.`);
      return { romPath: roms[0], tempDir };
    }
    throw new Error('Unsupported file type');
  }

  /** Helper: extract dialogue from a ROM path and save to langDir */
  async function extractDialogueFromRom(romAbsPath: string, langDir: string, langCode: string): Promise<{ success: boolean; error?: string }> {
    const sendLog = (channel: string, level: string, message: string) => {
      mainWindow?.webContents.send('log:entry', { channel, level, message });
    };
    sendLog('app', 'info', `Extracting language '${langCode}'...`);

    try {
      const rom = loadRom(romAbsPath, true);
      const strings = decodeStrings((addr) => rom.getByte(addr), rom.language);
      const text = formatDialogueText(strings);
      await mkdir(langDir, { recursive: true });
      await writeFile(join(langDir, 'dialogue.txt'), text, 'utf-8');
      sendLog('app', 'info', `Language '${langCode}' extracted successfully (${strings.length} strings)`);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendLog('error', 'error', `Language extraction failed: ${msg}`);
      return { success: false, error: msg };
    }
  }

  ipcMain.handle('languages:extract', async (_event, romFile: string, langCode: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    try { await access(localRomPath); } catch {
      return { success: false, error: `ROM not found: ${romFile}` };
    }
    const langDir = getUserDataPath('languages', langCode);
    return extractDialogueFromRom(localRomPath, langDir, langCode);
  });

  ipcMain.handle('languages:extractFromFile', async (_event, filePath: string, langCode: string) => {
    try {
      const { romPath, tempDir } = await resolveRomFile(filePath);
      try {
        const langDir = getUserDataPath('languages', langCode);
        return await extractDialogueFromRom(romPath, langDir, langCode);
      } finally {
        if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (err) {
      return { success: false, error: `${err instanceof Error ? err.message : err}` };
    }
  });

  ipcMain.handle('languages:extractFromUrl', async (_event, url: string, langCode: string) => {
    let tempFile: string | undefined;
    try {
      tempFile = await downloadToTemp(url, '.zip');
      const { romPath, tempDir } = await resolveRomFile(tempFile);
      try {
        const langDir = getUserDataPath('languages', langCode);
        return await extractDialogueFromRom(romPath, langDir, langCode);
      } finally {
        if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (err) {
      return { success: false, error: `${err instanceof Error ? err.message : err}` };
    } finally {
      if (tempFile) await rm(tempFile, { force: true }).catch(() => {});
    }
  });

  ipcMain.handle('languages:delete', async (_event, langCode: string) => {
    await rm(getUserDataPath('languages', langCode), { recursive: true, force: true });
  });

  ipcMain.handle('languages:getDialogue', async (_event, langCode: string) => {
    try {
      return await readFile(getUserDataPath('languages', langCode, 'dialogue.txt'), 'utf-8');
    } catch { return null; }
  });

  // ─── ROM info ───

  ipcMain.handle('roms:getInfo', async (_event, romFile: string) => {
    const romPath = getUserDataPath('roms', romFile);
    try {
      const s = await stat(romPath);
      const data = await readFile(romPath);
      // Compute simple hash (first 1KB + size)
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
      return {
        name: romFile,
        size: s.size,
        hash,
        created: s.birthtime.toISOString(),
        modified: s.mtime.toISOString(),
      };
    } catch { return null; }
  });

  // ─── Profile updates (rename, set language/msu) ───

  ipcMain.handle('profiles:update', async (_event, id: string, patch: Partial<Profile>) => {
    const profile = await loadProfile(id);
    if (!profile) return null;
    if (patch.name !== undefined) profile.name = patch.name;
    if (patch.language !== undefined) profile.language = patch.language;
    if (patch.msuPack !== undefined) profile.msuPack = patch.msuPack;
    await updateProfile(profile);
    return profile;
  });

  // Play sessions
  ipcMain.handle('sessions:list', async (_event, profileId: string) => {
    return listSessions(profileId);
  });

  ipcMain.handle('sessions:save', async (_event, profileId: string, session: unknown) => {
    await saveSession(profileId, session as any);
  });

  // Tracker state
  ipcMain.handle('tracker:save', async (_event, profileId: string, state: unknown) => {
    await saveTrackerState(profileId, state);
  });

  ipcMain.handle('tracker:load', async (_event, profileId: string) => {
    return loadTrackerState(profileId);
  });

  // Input profiles
  ipcMain.handle('inputProfiles:read', async (_event, profileId: string) => {
    return readInputProfiles(profileId);
  });

  ipcMain.handle('inputProfiles:write', async (_event, profileId: string, profiles: unknown[]) => {
    await writeInputProfiles(profileId, profiles);
  });

  // Stick calibration (global per-device)
  ipcMain.handle('stickCalibration:read', async () => {
    return readStickCalibration();
  });

  ipcMain.handle('stickCalibration:write', async (_event, store: Record<string, unknown>) => {
    await writeStickCalibration(store as any);
  });

  ipcMain.handle('triggerCalibration:read', async () => {
    return readTriggerCalibration();
  });

  ipcMain.handle('triggerCalibration:write', async (_event, deviceKey: string, axisIndex: number, cal: { base: number; max: number; deadzone: number }) => {
    await writeTriggerCalibration(deviceKey, axisIndex, cal);
  });

  // HID device enumeration (async — uses worker thread to avoid blocking main)
  ipcMain.handle('hid:enumerate', async () => {
    try {
      const rawDevices = await hidInputReader.enumerateDevicesAsync();
      return enumerateControllers(rawDevices);
    } catch {
      return enumerateControllers(); // fallback to sync if worker fails
    }
  });

  ipcMain.handle('hid:get-open-keys', () => {
    return hidInputReader.getOpenDeviceKeys();
  });

  // HID write (haptics, LED control) — forwards to node-hid in main process
  ipcMain.handle('hid:write', (_event, deviceKey: string, data: number[]) => {
    return hidInputReader.write(deviceKey, data);
  });

  // HID test vibration — plays a short haptic pattern on SPC2
  ipcMain.handle('hid:vibrate', (_event, deviceKey: string, durationMs: number, intensity: number) => {
    return hidInputReader.vibrate(deviceKey, durationMs, intensity);
  });

  // HID test vibration — original hardcoded procon2tool pattern (known-good baseline)
  ipcMain.handle('hid:test-vibration', (_event, deviceKey: string) => {
    return hidInputReader.testVibration(deviceKey);
  });

  // HID pattern vibration — flat segments with optional gaps
  ipcMain.handle('hid:vibrate-pattern', (_event, deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) => {
    return hidInputReader.vibratePattern(deviceKey, pattern, gapMs);
  });


  // Get userData path
  ipcMain.handle('app:getUserDataPath', () => app.getPath('userData'));

  // Sprite debug data (saved to userData/Data/sprite-debug.json)
  ipcMain.handle('spriteDebug:load', async () => {
    try {
      const data = await readFile(getUserDataPath('sprite-debug.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });
  ipcMain.handle('spriteDebug:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('sprite-debug.json'), JSON.stringify(data, null, 2), 'utf-8');
  });

  // Sprite review data (per-sprite image review, saved to userData/Data/sprite-review.json)
  ipcMain.handle('spriteReview:load', async () => {
    try {
      const data = await readFile(getUserDataPath('sprite-review.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });
  ipcMain.handle('spriteReview:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('sprite-review.json'), JSON.stringify(data, null, 2), 'utf-8');
  });

  // ─── Sprite extraction (per-ROM) ───

  function spriteDir(romFile: string): string {
    const stem = basename(romFile, extname(romFile));
    return getUserDataPath('sprites', stem);
  }

  ipcMain.handle('sprites:extract', async (_event, romFile: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    const outDir = spriteDir(romFile);

    try {
      await access(localRomPath);
    } catch {
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    await mkdir(outDir, { recursive: true });

    const sendLog = (channel: string, level: string, message: string) => {
      mainWindow?.webContents.send('log:entry', { channel, level, message });
    };

    sendLog('app', 'info', `Extracting sprites from ${romFile}...`);

    try {
      const result = extractAllItemSprites(localRomPath, outDir, spriteDefinitions.sprites as never);
      if (result.errors.length > 0) {
        for (const err of result.errors) {
          sendLog('core', 'error', err);
        }
      }
      sendLog('app', 'info', `Sprites extracted: ${result.total} files (${result.counts.hud} HUD, ${result.counts.receipt} receipt, ${result.counts.drop} drop)`);
      if (result.removedStale > 0) {
        sendLog('app', 'info', `Removed ${result.removedStale} stale sprite files`);
      }
      return { success: true, count: result.total };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      sendLog('error', 'error', `Sprite extraction failed: ${msg}`);
      return { success: false, error: msg };
    }
  });

  ipcMain.handle('sprites:check', async (_e, romFile: string) => {
    const outDir = spriteDir(romFile);
    try {
      const files = await readdir(outDir);
      const pngCount = files.filter(f => f.endsWith('.png')).length;
      return { extracted: pngCount > 0, count: pngCount };
    } catch {
      return { extracted: false, count: 0 };
    }
  });

  ipcMain.handle('sprites:delete', async (_e, romFile: string) => {
    const outDir = spriteDir(romFile);
    try {
      await rm(outDir, { recursive: true, force: true });
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  });

  ipcMain.handle('sprites:getPath', async (_e, romFile: string, file: string) => {
    return join(spriteDir(romFile), `${file}.png`);
  });
}

app.whenReady().then(async () => {
  initProfileManager(app.getPath('userData'));
  await migrateDataFolder();
  await ensureDataDirectories();

  registerIpcHandlers();
  createWindow();

  // Start reading HID controllers in the main process (node-hid)
  if (mainWindow) {
    hidInputReader.start(mainWindow);
  }



  // Set up a minimal application menu so clipboard shortcuts (Ctrl+C/V/X/A) work
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools', label: 'Developer Console', accelerator: 'F12' },
        { role: 'reload' },
        { role: 'forceReload' },
      ],
    },
  ]));

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

app.on('will-quit', () => {
  hidInputReader.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
