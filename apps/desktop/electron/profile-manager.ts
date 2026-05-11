import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, rm, stat } from 'fs/promises';
import { randomUUID } from 'crypto';
import type { Profile, AppState } from '../../../shared/types/profile';

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
