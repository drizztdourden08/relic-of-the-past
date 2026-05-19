import { join } from 'path';
import { readFile, mkdir, writeFile, readdir, rm, stat } from 'fs/promises';
import { randomUUID } from 'crypto';
import type { Profile } from '../../../../shared/types/profile';
import { getUserDataPath } from '../lib/paths';

async function listProfiles(): Promise<Profile[]> {
  const profilesDir = getUserDataPath('profiles');
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

async function createProfile(name: string, romFile: string, language?: string, msuPack?: string): Promise<Profile> {
  const id = randomUUID().slice(0, 8);
  const now = Date.now();
  const profile: Profile = { id, name, romFile, created: now, lastPlayed: now };
  if (language) profile.language = language;
  if (msuPack) profile.msuPack = msuPack;

  const profileDir = getUserDataPath('profiles', id);
  await mkdir(join(profileDir, 'saves'), { recursive: true });
  await writeFile(join(profileDir, 'profile.json'), JSON.stringify(profile, null, 2), 'utf-8');
  await writeFile(join(profileDir, 'config.json'), '{}', 'utf-8');

  return profile;
}

async function loadProfile(id: string): Promise<Profile | null> {
  try {
    const data = await readFile(getUserDataPath('profiles', id, 'profile.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function updateProfile(profile: Profile): Promise<void> {
  await writeFile(
    getUserDataPath('profiles', profile.id, 'profile.json'),
    JSON.stringify(profile, null, 2),
    'utf-8',
  );
}

async function deleteProfile(id: string): Promise<void> {
  await rm(getUserDataPath('profiles', id), { recursive: true, force: true });
}

export {
  createProfile,
  deleteProfile,
  listProfiles,
  loadProfile,
  updateProfile
};
