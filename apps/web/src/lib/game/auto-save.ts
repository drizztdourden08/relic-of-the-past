/* @layer bridge-wasm @kind logic */
/**
 * Auto-Save Service — timer-based and save-on-quit state persistence.
 * Creates full save state snapshots at configurable intervals and on game stop.
 */

import { log } from '../log-bus';
import * as savesStore from '../storage/saves-store';
import { saveMusicPosition } from './msu-save-glue';
import { getModule, getProfileId } from './wasm-bridge';
import { captureGameFrameBlob } from './capture-frame';

let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
let autoSaveSlot = 99; // Dedicated MEMFS slot for auto-save (not user-visible)

const captureScreenshot = async (): Promise<ArrayBuffer | undefined> => {
  const blob = await captureGameFrameBlob();
  return blob ? await blob.arrayBuffer() : undefined;
};

const performAutoSave = async (trigger: 'timer' | 'quit'): Promise<boolean> => {
  const mod = getModule();
  const profileId = getProfileId();
  if (!mod || !profileId) return false;

  try {
    log.app(`[AutoSave] Creating ${trigger} auto-save...`);

    // Use a dedicated slot to avoid conflicts with user quick saves
    mod.ccall('WasmSaveState', null, ['number'], [autoSaveSlot]);

    const savePath = `/saves/save${autoSaveSlot}.sav`;
    const { exists } = mod.FS.analyzePath(savePath);
    if (!exists) {
      log.app('[AutoSave] ABORT: file not found in MEMFS after ccall');
      return false;
    }

    const data = mod.FS.readFile(savePath);
    const ab = (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength);

    // Capture screenshot
    const screenshot = await captureScreenshot();

    // Send to main process
    const created = await savesStore.createAutoSave(profileId, trigger, ab, screenshot);
    if (created?.id) await saveMusicPosition(profileId, 'auto', created.id);
    log.app(`[AutoSave] ${trigger} auto-save created (${(ab.byteLength / 1024).toFixed(0)} KB)`);

    // Clean up MEMFS temp file
    try { (mod.FS as any).unlink(savePath); } catch { /* ignore */ }

    return true;
  } catch (err) {
    log.error(`[AutoSave] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
};

const pruneIfNeeded = async (maxEntries: number): Promise<void> => {
  const profileId = getProfileId();
  if (!profileId) return;
  try {
    await savesStore.pruneAutoSaves(profileId, maxEntries);
  } catch {
    // Best effort
  }
};

const startAutoSave = (intervalSeconds: number, maxEntries: number): void => {
  stopAutoSave();
  const intervalMs = Math.max(60, Math.min(1800, intervalSeconds)) * 1000;
  log.app(`[AutoSave] Starting timer (interval=${intervalSeconds}s, max=${maxEntries})`);

  autoSaveInterval = setInterval(async () => {
    const success = await performAutoSave('timer');
    if (success) {
      await pruneIfNeeded(maxEntries);
    }
  }, intervalMs);
};

const stopAutoSave = (): void => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
};

const saveOnQuit = async (): Promise<boolean> => {
  return performAutoSave('quit');
};

export { performAutoSave, saveOnQuit, startAutoSave, stopAutoSave };
