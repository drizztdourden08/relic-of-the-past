import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, stat, rename as fsRename } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';

export const QUICK_SAVE_SLOTS = 12;

function getProfileSavesDir(profileId: string): string {
  return getUserDataPath('profiles', profileId, 'saves');
}

function getQuickSavesDir(profileId: string): string {
  return join(getProfileSavesDir(profileId), 'quick');
}

// ─── Migration: move legacy save{N}.sav from root saves/ to saves/quick/ ───

async function migrateQuickSaves(profileId: string): Promise<void> {
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
}

// ─── SRAM ───

async function writeSramFile(profileId: string, data: Buffer): Promise<void> {
  const savesDir = getProfileSavesDir(profileId);
  await mkdir(savesDir, { recursive: true });
  const sramPath = join(savesDir, 'sram.dat');
  const bakPath = join(savesDir, 'sram.bak');
  try {
    await stat(sramPath);
    await fsRename(sramPath, bakPath);
  } catch { /* no existing file */ }
  await writeFile(sramPath, data);
}

async function readSramFile(profileId: string): Promise<Buffer | null> {
  try {
    return await readFile(join(getProfileSavesDir(profileId), 'sram.dat'));
  } catch {
    return null;
  }
}

// ─── Quick Save States (slots 0-11) ───

async function writeQuickState(profileId: string, slot: number, data: Buffer): Promise<void> {
  const quickDir = getQuickSavesDir(profileId);
  await mkdir(quickDir, { recursive: true });
  await writeFile(join(quickDir, `save${slot}.sav`), data);
}

async function readQuickState(profileId: string, slot: number): Promise<Buffer | null> {
  try {
    return await readFile(join(getQuickSavesDir(profileId), `save${slot}.sav`));
  } catch {
    return null;
  }
}

async function listQuickStates(profileId: string): Promise<number[]> {
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
}

async function writeQuickScreenshot(profileId: string, slot: number, pngData: Buffer): Promise<void> {
  const quickDir = getQuickSavesDir(profileId);
  await mkdir(quickDir, { recursive: true });
  await writeFile(join(quickDir, `save${slot}.png`), pngData);
}

async function readQuickScreenshot(profileId: string, slot: number): Promise<Buffer | null> {
  try {
    return await readFile(join(getQuickSavesDir(profileId), `save${slot}.png`));
  } catch {
    return null;
  }
}

interface SaveSlotInfo {
  slot: number;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
}

async function getQuickSlotInfos(profileId: string): Promise<SaveSlotInfo[]> {
  await migrateQuickSaves(profileId);
  const quickDir = getQuickSavesDir(profileId);
  const results: SaveSlotInfo[] = [];
  for (let slot = 0; slot < QUICK_SAVE_SLOTS; slot++) {
    const savPath = join(quickDir, `save${slot}.sav`);
    try {
      const s = await stat(savPath);
      let hasScreenshot = false;
      try {
        await stat(join(quickDir, `save${slot}.png`));
        hasScreenshot = true;
      } catch { /* no screenshot */ }
      results.push({ slot, timestamp: s.mtimeMs, size: s.size, hasScreenshot });
    } catch {
      // Slot doesn't exist
    }
  }
  return results;
}

// ─── Legacy aliases (backward compat) ───

const writeStateFile = writeQuickState;
const readStateFile = readQuickState;
const listStateFiles = listQuickStates;
const writeStateScreenshot = writeQuickScreenshot;
const readStateScreenshot = readQuickScreenshot;
const getStateSlotInfos = getQuickSlotInfos;

export {
  getProfileSavesDir,
  getQuickSavesDir,
  getQuickSlotInfos,
  getStateSlotInfos,
  listQuickStates,
  listStateFiles,
  migrateQuickSaves,
  readQuickScreenshot,
  readQuickState,
  readSramFile,
  readStateFile,
  readStateScreenshot,
  writeQuickScreenshot,
  writeQuickState,
  writeSramFile,
  writeStateFile,
  writeStateScreenshot,
};
export type { SaveSlotInfo };
