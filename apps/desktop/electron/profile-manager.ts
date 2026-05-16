import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, rm, stat, rename, access, cp } from 'fs/promises';
import { randomUUID } from 'crypto';
import type { Profile, AppState } from '../../../shared/types/profile';
import type { GameSettings } from '../../../shared/types/settings';
import type { PlaySession } from '../../../shared/types/session';

let userDataPath = '';

export function initProfileManager(dataPath: string): void {
  userDataPath = dataPath;
}

/** All app data lives under userData/Data/ */
function path(...segments: string[]): string {
  return join(userDataPath, 'Data', ...segments);
}

/** Legacy path (pre-migration, directly under userData/) */
function legacyPath(...segments: string[]): string {
  return join(userDataPath, ...segments);
}

/** Ensure all Data/ subdirectories exist */
export async function ensureDataDirectories(): Promise<void> {
  const dirs = ['assets', 'roms', 'profiles', 'config', 'msu', 'languages', 'sprites'];
  for (const dir of dirs) {
    await mkdir(path(dir), { recursive: true });
  }
}

async function exists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}

/**
 * Migrate data from old flat structure (userData/{roms,profiles,...}) to
 * new structure (userData/Data/{roms,profiles,...}). Safe to call multiple
 * times — skips if Data/ already has content or old dirs don't exist.
 */
export async function migrateDataFolder(): Promise<void> {
  const dataDir = path();
  const migrationDirs = ['roms', 'profiles', 'assets', 'config'];

  // Check if migration is needed: any old dirs exist AND Data/ doesn't have them yet
  let needsMigration = false;
  for (const dir of migrationDirs) {
    const oldDir = legacyPath(dir);
    const newDir = path(dir);
    if (await exists(oldDir) && !(await exists(newDir))) {
      needsMigration = true;
      break;
    }
  }

  // Also check for app.json
  const oldAppJson = legacyPath('app.json');
  const newAppJson = path('app.json');
  if (await exists(oldAppJson) && !(await exists(newAppJson))) {
    needsMigration = true;
  }

  if (!needsMigration) return;

  await mkdir(dataDir, { recursive: true });

  // Move directories
  for (const dir of migrationDirs) {
    const oldDir = legacyPath(dir);
    const newDir = path(dir);
    if (await exists(oldDir) && !(await exists(newDir))) {
      try {
        await rename(oldDir, newDir);
      } catch {
        // rename across drives fails — fall back to copy + delete
        await cp(oldDir, newDir, { recursive: true });
        await rm(oldDir, { recursive: true, force: true });
      }
    }
  }

  // Move app.json
  if (await exists(oldAppJson) && !(await exists(newAppJson))) {
    try {
      await rename(oldAppJson, newAppJson);
    } catch {
      const data = await readFile(oldAppJson, 'utf-8');
      await writeFile(newAppJson, data, 'utf-8');
      await rm(oldAppJson, { force: true });
    }
  }

  // Migrate MSU files from per-profile to shared Data/msu/
  await migrateMsuPacks();
}

/** Move MSU files out of profiles/{id}/msu/ into shared Data/msu/{profileName}/ */
async function migrateMsuPacks(): Promise<void> {
  const profilesDir = path('profiles');
  let entries: string[];
  try { entries = await readdir(profilesDir); } catch { return; }

  for (const entry of entries) {
    const profileMsuDir = join(profilesDir, entry, 'msu');
    if (!(await exists(profileMsuDir))) continue;

    let files: string[];
    try { files = await readdir(profileMsuDir); } catch { continue; }
    if (files.length === 0) continue;

    // Load profile to get name for the pack
    let profileName = entry;
    try {
      const data = await readFile(join(profilesDir, entry, 'profile.json'), 'utf-8');
      const p = JSON.parse(data) as Profile;
      profileName = p.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      // Update profile to reference the MSU pack
      p.msuPack = profileName;
      await writeFile(join(profilesDir, entry, 'profile.json'), JSON.stringify(p, null, 2), 'utf-8');
    } catch { /* use id */ }

    const sharedMsuDir = path('msu', profileName);
    await mkdir(sharedMsuDir, { recursive: true });

    for (const file of files) {
      const src = join(profileMsuDir, file);
      const dst = join(sharedMsuDir, file);
      if (!(await exists(dst))) {
        try { await rename(src, dst); } catch {
          const data = await readFile(src);
          await writeFile(dst, data);
          await rm(src, { force: true });
        }
      }
    }

    // Remove old msu dir
    await rm(profileMsuDir, { recursive: true, force: true });
  }
}

// ─── App State ───

export async function loadAppState(): Promise<AppState> {
  try {
    const data = await readFile(path('app.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lastProfileId: null };
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  await writeFile(path('app.json'), JSON.stringify(state, null, 2), 'utf-8');
}

// ─── Profiles ───

export async function listProfiles(): Promise<Profile[]> {
  const profilesDir = path('profiles');
  await mkdir(profilesDir, { recursive: true });

  let entries: string[];
  try {
    entries = await readdir(profilesDir);
  } catch {
    return [];
  }

  const profiles: Profile[] = [];
  for (const entry of entries) {
    try {
      const profilePath = join(profilesDir, entry, 'profile.json');
      const data = await readFile(profilePath, 'utf-8');
      profiles.push(JSON.parse(data));
    } catch {
      // Skip invalid profile dirs
    }
  }

  return profiles.sort((a, b) => b.lastPlayed - a.lastPlayed);
}

export async function createProfile(name: string, romFile: string, language?: string, msuPack?: string): Promise<Profile> {
  const id = randomUUID().slice(0, 8);
  const now = Date.now();
  const profile: Profile = { id, name, romFile, created: now, lastPlayed: now };
  if (language) profile.language = language;
  if (msuPack) profile.msuPack = msuPack;

  const profileDir = path('profiles', id);
  await mkdir(join(profileDir, 'saves'), { recursive: true });
  await writeFile(join(profileDir, 'profile.json'), JSON.stringify(profile, null, 2), 'utf-8');
  await writeFile(join(profileDir, 'config.json'), '{}', 'utf-8');

  return profile;
}

export async function loadProfile(id: string): Promise<Profile | null> {
  try {
    const data = await readFile(path('profiles', id, 'profile.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function updateProfile(profile: Profile): Promise<void> {
  await writeFile(
    path('profiles', profile.id, 'profile.json'),
    JSON.stringify(profile, null, 2),
    'utf-8',
  );
}

export async function deleteProfile(id: string): Promise<void> {
  await rm(path('profiles', id), { recursive: true, force: true });
}

// ─── ROM management ───

export async function listRoms(): Promise<string[]> {
  const romsDir = path('roms');
  await mkdir(romsDir, { recursive: true });

  try {
    const files = await readdir(romsDir);
    return files.filter((f) => /\.(sfc|smc)$/i.test(f));
  } catch {
    return [];
  }
}

export async function hasAssetForRom(romFile: string): Promise<boolean> {
  const assetFile = romFile.replace(/\.(sfc|smc)$/i, '.dat');
  try {
    const s = await stat(path('assets', assetFile));
    return s.size > 0;
  } catch {
    return false;
  }
}

export function getAssetFileName(romFile: string): string {
  return romFile.replace(/\.(sfc|smc)$/i, '.dat');
}

// ─── Save file management ───

export function getProfileSavesDir(profileId: string): string {
  return path('profiles', profileId, 'saves');
}

export async function writeSramFile(profileId: string, data: Buffer): Promise<void> {
  const savesDir = getProfileSavesDir(profileId);
  await mkdir(savesDir, { recursive: true });
  const sramPath = join(savesDir, 'sram.dat');
  const bakPath = join(savesDir, 'sram.bak');
  // Backup existing
  try {
    await stat(sramPath);
    const { rename: fsRename } = await import('fs/promises');
    await fsRename(sramPath, bakPath);
  } catch { /* no existing file */ }
  await writeFile(sramPath, data);
}

export async function readSramFile(profileId: string): Promise<Buffer | null> {
  try {
    return await readFile(join(getProfileSavesDir(profileId), 'sram.dat'));
  } catch {
    return null;
  }
}

export async function writeStateFile(profileId: string, slot: number, data: Buffer): Promise<void> {
  const savesDir = getProfileSavesDir(profileId);
  await mkdir(savesDir, { recursive: true });
  await writeFile(join(savesDir, `save${slot}.sav`), data);
}

export async function writeStateScreenshot(profileId: string, slot: number, pngData: Buffer): Promise<void> {
  const savesDir = getProfileSavesDir(profileId);
  await mkdir(savesDir, { recursive: true });
  await writeFile(join(savesDir, `save${slot}.png`), pngData);
}

export async function readStateScreenshot(profileId: string, slot: number): Promise<Buffer | null> {
  try {
    return await readFile(join(getProfileSavesDir(profileId), `save${slot}.png`));
  } catch {
    return null;
  }
}

export interface SaveSlotInfo {
  slot: number;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
}

export async function getStateSlotInfos(profileId: string): Promise<SaveSlotInfo[]> {
  const savesDir = getProfileSavesDir(profileId);
  const results: SaveSlotInfo[] = [];
  for (let slot = 0; slot < 10; slot++) {
    const savPath = join(savesDir, `save${slot}.sav`);
    try {
      const s = await stat(savPath);
      let hasScreenshot = false;
      try {
        await stat(join(savesDir, `save${slot}.png`));
        hasScreenshot = true;
      } catch { /* no screenshot */ }
      results.push({ slot, timestamp: s.mtimeMs, size: s.size, hasScreenshot });
    } catch {
      // Slot doesn't exist — skip
    }
  }
  return results;
}

export async function readStateFile(profileId: string, slot: number): Promise<Buffer | null> {
  try {
    return await readFile(join(getProfileSavesDir(profileId), `save${slot}.sav`));
  } catch {
    return null;
  }
}

export async function listStateFiles(profileId: string): Promise<number[]> {
  const savesDir = getProfileSavesDir(profileId);
  try {
    const files = await readdir(savesDir);
    return files
      .filter((f) => /^save\d+\.sav$/.test(f))
      .map((f) => parseInt(f.match(/^save(\d+)\.sav$/)![1], 10))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

// ─── Per-profile config (settings) ───

export async function readConfig(profileId: string): Promise<Partial<GameSettings> | null> {
  try {
    const data = await readFile(path('profiles', profileId, 'config.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function writeConfig(profileId: string, settings: GameSettings): Promise<void> {
  const profileDir = path('profiles', profileId);
  await mkdir(profileDir, { recursive: true });
  await writeFile(join(profileDir, 'config.json'), JSON.stringify(settings, null, 2), 'utf-8');
}

// ─── Play sessions ───

export async function listSessions(profileId: string): Promise<PlaySession[]> {
  try {
    const data = await readFile(path('profiles', profileId, 'sessions.json'), 'utf-8');
    const sessions: PlaySession[] = JSON.parse(data);
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  } catch {
    return [];
  }
}

export async function saveSession(profileId: string, session: PlaySession): Promise<void> {
  const profileDir = path('profiles', profileId);
  await mkdir(profileDir, { recursive: true });
  const filePath = join(profileDir, 'sessions.json');
  let sessions: PlaySession[] = [];
  try {
    const data = await readFile(filePath, 'utf-8');
    sessions = JSON.parse(data);
  } catch { /* new file */ }
  sessions.push(session);
  // Keep last 100 sessions
  if (sessions.length > 100) sessions = sessions.slice(-100);
  await writeFile(filePath, JSON.stringify(sessions, null, 2), 'utf-8');
}

// ─── Tracker state ───

export async function saveTrackerState(profileId: string, state: unknown): Promise<void> {
  const profileDir = path('profiles', profileId);
  await mkdir(profileDir, { recursive: true });
  await writeFile(join(profileDir, 'tracker.json'), JSON.stringify(state, null, 2), 'utf-8');
}

export async function loadTrackerState(profileId: string): Promise<unknown | null> {
  try {
    const data = await readFile(path('profiles', profileId, 'tracker.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// ─── Input profiles ───

export async function readInputProfiles(profileId: string): Promise<unknown[]> {
  try {
    const data = await readFile(path('profiles', profileId, 'input-profiles.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function writeInputProfiles(profileId: string, profiles: unknown[]): Promise<void> {
  const profileDir = path('profiles', profileId);
  await mkdir(profileDir, { recursive: true });
  await writeFile(join(profileDir, 'input-profiles.json'), JSON.stringify(profiles, null, 2), 'utf-8');
}

// ─── Stick calibration (per-device, keyed by "vid:pid") ───

export interface StickCalibrationData {
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  innerDeadzone: number;
  outerDeadzone: number;
}

export interface DeviceStickCalibration {
  left: StickCalibrationData;
  right: StickCalibrationData;
  updatedAt: string;
}

/** All stick calibrations keyed by "vid:pid" */
export type StickCalibrationStore = Record<string, DeviceStickCalibration>;

const STICK_CAL_FILE = 'stick-calibration.json';

export async function readStickCalibration(): Promise<StickCalibrationStore> {
  try {
    const data = await readFile(path(STICK_CAL_FILE), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function writeStickCalibration(store: StickCalibrationStore): Promise<void> {
  await writeFile(path(STICK_CAL_FILE), JSON.stringify(store, null, 2), 'utf-8');
}
