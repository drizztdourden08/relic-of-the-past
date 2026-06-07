/* @layer tests @kind logic */
/**
 * Shared Playwright helpers for Electron app testing.
 *
 * Provides:
 *  - launchApp()       → launch a fresh Electron instance
 *  - clearAppData()    → wipe userData for a clean slate
 *  - importRom()       → import a ROM file via IPC
 *  - extractAssets()   → extract assets for an imported ROM
 *  - createProfile()   → create a profile for a ROM
 *  - seedSingleProfile()  → import ROM + extract + create 1 profile (ready to play)
 *  - seedMultiProfile()   → import ROM + extract + create 2 profiles (shows picker)
 *  - getLogEntries()   → pull LogBus entries from renderer
 *  - getScreen()       → detect which screen is visible
 *  - navigateToPicker() → from game screen, open menu → Switch Profile
 */

import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { join } from 'path';
import { rm, readdir } from 'fs/promises';

// ─── Paths ───

const PROJECT_ROOT = join(__dirname, '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
const TEST_ROMS_DIR = join(PROJECT_ROOT, 'test-roms');
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'tests', 'screenshots');

const TEST_ROMS = {
  usa: join(TEST_ROMS_DIR, 'Legend of Zelda, The - A Link to the Past (USA).sfc'),
  canada: join(TEST_ROMS_DIR, 'Legend of Zelda, The - A Link to the Past (Canada).sfc'),
  france: join(TEST_ROMS_DIR, 'Legend of Zelda, The - A Link to the Past (France).sfc'),
} as const;

const ROM_FILES = {
  usa: 'Legend of Zelda, The - A Link to the Past (USA).sfc',
  canada: 'Legend of Zelda, The - A Link to the Past (Canada).sfc',
  france: 'Legend of Zelda, The - A Link to the Past (France).sfc',
} as const;

const USER_DATA_PATH = join(
  process.env.APPDATA ?? join(process.env.HOME ?? '', 'AppData', 'Roaming'),
  'relic-of-the-past',
);

// ─── App lifecycle ───

const launchApp = async (opts?: { muted?: boolean; noFocus?: boolean }): Promise<{ app: ElectronApplication; window: Page }> => {
  const args = [MAIN_JS];
  if (opts?.muted) args.push('--muted');
  if (opts?.noFocus) args.push('--no-focus');

  const app = await electron.launch({
    args,
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(1500);
  return { app, window };
};

const clearAppData = async (): Promise<void> => {
  // Delete subdirectories we manage, skip Chromium internals (DIPS, etc.) that may be locked
  const managedDirs = ['assets', 'roms', 'profiles', 'config'];
  const managedFiles = ['app.json'];

  for (const dir of managedDirs) {
    await rm(join(USER_DATA_PATH, dir), { recursive: true, force: true });
  }
  for (const file of managedFiles) {
    await rm(join(USER_DATA_PATH, file), { force: true });
  }
};

// ─── Screen detection ───

type ScreenName = 'loading' | 'picker' | 'profile' | 'game';

const getScreen = async (window: Page): Promise<ScreenName> => {
  return window.evaluate(() => {
    // Only consider visible fullscreen layers (not hidden/persistent ones)
    const visible = (sel: string) => {
      const el = document.querySelector(sel);
      return el && (el.closest('.fullscreen-layer') as HTMLElement)?.style.display !== 'none';
    };
    if (visible('.fullscreen-layer .picker')) return 'picker';
    if (visible('.fullscreen-layer .profile-hub')) return 'profile';
    if (document.querySelector('.game-layer__canvas')) return 'game';
    return 'loading';
  }) as Promise<ScreenName>;
};

const waitForScreen = async (window: Page, screen: ScreenName, timeoutMs = 15_000): Promise<void> => {
  if (screen === 'picker') {
    await window.waitForSelector('.fullscreen-layer .picker', { timeout: timeoutMs });
  } else if (screen === 'profile') {
    await window.waitForSelector('.fullscreen-layer:not([style*="display: none"]) .profile-hub', { timeout: timeoutMs });
  } else if (screen === 'game') {
    // Wait for all visible fullscreen layers to disappear (hidden ones may persist)
    await window.waitForFunction(
      () => !document.querySelector('.fullscreen-layer:not([style*="display: none"])'),
      { timeout: timeoutMs },
    );
    await window.waitForSelector('.game-layer__canvas', { state: 'attached', timeout: timeoutMs });
  } else {
    await window.waitForSelector('.app', { timeout: timeoutMs });
  }
  // Extra settle time for async state updates
  await window.waitForTimeout(500);
};

// ─── ROM operations ───

const importRom = async (window: Page, romPath: string): Promise<{ success: boolean; romFile: string; alreadyExists?: boolean; error?: string }> => {
  return window.evaluate(
    (path) => window.api.importRom(path),
    romPath,
  );
};

const deleteRom = async (window: Page, romFile: string): Promise<void> => {
  return window.evaluate(
    (rf) => window.api.deleteRom(rf),
    romFile,
  );
};

const extractAssets = async (window: Page, romFile: string): Promise<{ success: boolean; error?: string }> => {
  return window.evaluate(
    (rf) => window.api.extractAssets(rf),
    romFile,
  );
};

const checkAssets = async (window: Page, romFile: string): Promise<boolean> => {
  return window.evaluate(
    (rf) => window.api.checkAssets(rf),
    romFile,
  );
};

const listRoms = async (window: Page): Promise<string[]> => {
  return window.evaluate(() => window.api.listRoms());
};

const listRomsWithStatus = async (window: Page): Promise<Array<{ romFile: string; hasAssets: boolean; assetSize: number | null }>> => {
  return window.evaluate(() => window.api.listRomsWithStatus());
};

const loadAssetSize = async (window: Page, romFile: string): Promise<number> => {
  return window.evaluate(
    (rf) => window.api.loadAssets(rf).then((b: ArrayBuffer | null) => b?.byteLength ?? 0),
    romFile,
  );
};

// ─── Profile operations ───

const listProfiles = async (window: Page): Promise<Array<{ id: string; name: string; romFile: string; created: number; lastPlayed: number }>> => {
  return window.evaluate(() => window.api.listProfiles());
};

const createProfile = async (window: Page, name: string, romFile: string): Promise<{ id: string; name: string; romFile: string; created: number; lastPlayed: number }> => {
  return window.evaluate(
    ({ n, r }) => window.api.createProfile(n, r),
    { n: name, r: romFile },
  );
};

const deleteProfile = async (window: Page, id: string): Promise<void> => {
  return window.evaluate((pid) => window.api.deleteProfile(pid), id);
};

const getAppState = async (window: Page): Promise<{ lastProfileId: string | null }> => {
  return window.evaluate(() => window.api.getAppState());
};

// ─── Compound helpers (seed state) ───

const seedSingleProfile = async (window: Page, romPath: string, profileName: string): Promise<{ romFile: string; profileId: string }> => {
  const imp = await importRom(window, romPath);
  if (!imp.success) throw new Error(`Import failed: ${imp.error}`);

  const ext = await extractAssets(window, imp.romFile);
  if (!ext.success) throw new Error(`Extract failed: ${ext.error}`);

  const profile = await createProfile(window, profileName, imp.romFile);
  return { romFile: imp.romFile, profileId: profile.id };
};

const seedMultiProfile = async (window: Page, romPath: string, names: [string, string]): Promise<{ romFile: string; profileIds: [string, string] }> => {
  const imp = await importRom(window, romPath);
  if (!imp.success) throw new Error(`Import failed: ${imp.error}`);

  const ext = await extractAssets(window, imp.romFile);
  if (!ext.success) throw new Error(`Extract failed: ${ext.error}`);

  const p1 = await createProfile(window, names[0], imp.romFile);
  const p2 = await createProfile(window, names[1], imp.romFile);
  return { romFile: imp.romFile, profileIds: [p1.id, p2.id] };
};

// ─── UI interactions ───

const navigateToPicker = async (window: Page): Promise<void> => {
  await window.click('[aria-label="Menu"]');
  await window.waitForTimeout(300);
  const switchBtn = window.locator('.dropdown__item', { hasText: /Switch Profile|New Profile/ });
  await switchBtn.click();
  // If game is running, confirm the dialog
  const dialog = window.locator('.dialog-backdrop');
  if (await dialog.isVisible({ timeout: 500 }).catch(() => false)) {
    await window.locator('.dialog .btn--primary, .dialog .btn--danger').click();
    await window.waitForTimeout(300);
  }
  await waitForScreen(window, 'picker');
};

const openMenu = async (window: Page): Promise<void> => {
  await window.click('[aria-label="Menu"]');
  await window.waitForTimeout(300);
};

const startGameFromProfile = async (window: Page, timeoutMs = 15_000): Promise<void> => {
  await waitForScreen(window, 'profile', timeoutMs);
  const startBtn = window.locator('.profile-hub .btn--primary', { hasText: /Play/ });
  await startBtn.click();
  await waitForScreen(window, 'game', timeoutMs);
};

// ─── Logging ───

interface LogEntry {
  channel: string;
  level: string;
  message: string;
}

const getLogEntries = async (window: Page): Promise<LogEntry[]> => {
  return window.evaluate(() => (window as any).__logEntries?.() ?? []);
};

const printLogs = (entries: LogEntry[]): void => {
  for (const e of entries) {
    console.log(`  [${e.channel}/${e.level}] ${e.message}`);
  }
};

// ─── Screenshot helper ───

const screenshot = async (window: Page, name: string): Promise<void> => {
  await window.screenshot({ path: join(SCREENSHOTS_DIR, `${name}.png`) });
};

export { PROJECT_ROOT, MAIN_JS, TEST_ROMS_DIR, SCREENSHOTS_DIR, TEST_ROMS, ROM_FILES, launchApp, clearAppData, getScreen, waitForScreen, importRom, deleteRom, extractAssets, checkAssets, listRoms, listRomsWithStatus, loadAssetSize, listProfiles, createProfile, deleteProfile, getAppState, seedSingleProfile, seedMultiProfile, navigateToPicker, openMenu, startGameFromProfile, getLogEntries, printLogs, screenshot };
export type { ScreenName, LogEntry };
