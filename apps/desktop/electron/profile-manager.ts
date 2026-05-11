import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, rm, stat } from 'fs/promises';
import { randomUUID } from 'crypto';
import type { Profile, AppState } from '../../../shared/types/profile';
import type { GameSettings } from '../../../shared/types/settings';
import type { PlaySession } from '../../../shared/types/session';

let userDataPath = '';

export function initProfileManager(dataPath: string): void {
  userDataPath = dataPath;
}

function path(...segments: string[]): string {
  return join(userDataPath, ...segments);
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

export async function createProfile(name: string, romFile: string): Promise<Profile> {
  const id = randomUUID().slice(0, 8);
  const now = Date.now();
  const profile: Profile = { id, name, romFile, created: now, lastPlayed: now };

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
  for (let slot = 0; slot < 4; slot++) {
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
