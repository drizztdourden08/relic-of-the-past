import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, stat, unlink, rename as fsRename } from 'fs/promises';
import { MSU_SIDECAR_SUFFIX } from '@shared/storage/save-paths';
import { getUserDataPath } from '../lib/paths';
import { statSaveSlot } from './save-slot';

const QUICK_SAVE_SLOTS = 12;

const getProfileSavesDir = (profileId: string): string => {
  return getUserDataPath('profiles', profileId, 'saves');
};

const getQuickSavesDir = (profileId: string): string => {
  return join(getProfileSavesDir(profileId), 'quick');
};

// ─── Migration: move legacy save{N}.sav from root saves/ to saves/quick/ ───

const migrateQuickSaves = async (profileId: string): Promise<void> => {
  const savesDir = getProfileSavesDir(profileId);
  const quickDir = getQuickSavesDir(profileId);
  try {
    const files = await readdir(savesDir);
    const legacyFiles = files.filter((f) => /^save\d+\.(sav|png)$/.test(f));
    if (legacyFiles.length === 0) return;
    await mkdir(quickDir, { recursive: true });
    for (const file of legacyFiles) {
      const src = join(savesDir, file);
      const dest = join(quickDir, file);
      try {
        await stat(dest);
        // Already exists in quick/ — skip
      } catch {
        await fsRename(src, dest);
      }
    }
  } catch {
    // saves dir doesn't exist yet — nothing to migrate
  }
};

// ─── SRAM ───

const writeSramFile = async (profileId: string, data: Buffer): Promise<void> => {
  const savesDir = getProfileSavesDir(profileId);
  await mkdir(savesDir, { recursive: true });
  const sramPath = join(savesDir, 'sram.dat');
  const bakPath = join(savesDir, 'sram.bak');
  try {
    await stat(sramPath);
    await fsRename(sramPath, bakPath);
  } catch { /* no existing file */ }
  await writeFile(sramPath, data);
};

const readSramFile = async (profileId: string): Promise<Buffer | null> => {
  try {
    return await readFile(join(getProfileSavesDir(profileId), 'sram.dat'));
  } catch {
    return null;
  }
};

// ─── Quick Save States (slots 0-11) ───

// A quick slot is written over in place, so its music-resume sidecar goes with the
// state it described. A caller with a fresh snapshot writes it after this call.
const writeQuickState = async (profileId: string, slot: number, data: Buffer): Promise<void> => {
  const quickDir = getQuickSavesDir(profileId);
  await mkdir(quickDir, { recursive: true });
  await writeFile(join(quickDir, `save${slot}.sav`), data);
  try { await unlink(join(quickDir, `save${slot}${MSU_SIDECAR_SUFFIX}`)); } catch { /* none to clear */ }
};

const readQuickState = async (profileId: string, slot: number): Promise<Buffer | null> => {
  try {
    return await readFile(join(getQuickSavesDir(profileId), `save${slot}.sav`));
  } catch {
    return null;
  }
};

const listQuickStates = async (profileId: string): Promise<number[]> => {
  const quickDir = getQuickSavesDir(profileId);
  try {
    const files = await readdir(quickDir);
    return files
      .filter((f) => /^save\d+\.sav$/.test(f))
      .map((f) => parseInt(f.match(/^save(\d+)\.sav$/)![1], 10))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
};

const writeQuickScreenshot = async (profileId: string, slot: number, pngData: Buffer): Promise<void> => {
  const quickDir = getQuickSavesDir(profileId);
  await mkdir(quickDir, { recursive: true });
  await writeFile(join(quickDir, `save${slot}.png`), pngData);
};

const readQuickScreenshot = async (profileId: string, slot: number): Promise<Buffer | null> => {
  try {
    return await readFile(join(getQuickSavesDir(profileId), `save${slot}.png`));
  } catch {
    return null;
  }
};

interface SaveSlotInfo {
  slot: number;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
}

const getQuickSlotInfos = async (profileId: string): Promise<SaveSlotInfo[]> => {
  await migrateQuickSaves(profileId);
  const quickDir = getQuickSavesDir(profileId);
  const results: SaveSlotInfo[] = [];
  for (let slot = 0; slot < QUICK_SAVE_SLOTS; slot++) {
    const info = await statSaveSlot(join(quickDir, `save${slot}.sav`), join(quickDir, `save${slot}.png`));
    if (!info) continue; // slot doesn't exist
    results.push({ slot, timestamp: info.mtimeMs, size: info.size, hasScreenshot: info.hasScreenshot });
  }
  return results;
};

export {
  getProfileSavesDir,
  getQuickSavesDir,
  getQuickSlotInfos,
  listQuickStates,
  migrateQuickSaves,
  readQuickScreenshot,
  readQuickState,
  readSramFile,
  writeQuickScreenshot,
  writeQuickState,
  writeSramFile,
  QUICK_SAVE_SLOTS,
};
export type { SaveSlotInfo };
