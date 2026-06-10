/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir, readdir, rm } from 'fs/promises';
import { randomUUID } from 'crypto';
import type { Profile } from '@shared/types/profile';
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';

const profilePath = (id: string): string => getUserDataPath('profiles', id, 'profile.json');

const listProfiles = async (): Promise<Profile[]> => {
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
    const profile = await readJson<Profile | null>(join(profilesDir, entry, 'profile.json'), null);
    if (profile) profiles.push(profile);
  }

  return profiles.sort((a, b) => b.lastPlayed - a.lastPlayed);
};

const createProfile = async (name: string, romFile: string, language?: string, msuPack?: string): Promise<Profile> => {
  const id = randomUUID().slice(0, 8);
  const now = Date.now();
  const profile: Profile = { id, name, romFile, created: now, lastPlayed: now };
  if (language) profile.language = language;
  if (msuPack) profile.msuPack = msuPack;

  await mkdir(getUserDataPath('profiles', id, 'saves'), { recursive: true });
  await writeJson(profilePath(id), profile);
  await writeJson(getUserDataPath('profiles', id, 'config.json'), {});

  return profile;
};

const loadProfile = (id: string): Promise<Profile | null> =>
  readJson<Profile | null>(profilePath(id), null);

const updateProfile = (profile: Profile): Promise<void> =>
  writeJson(profilePath(profile.id), profile);

const deleteProfile = (id: string): Promise<void> =>
  rm(getUserDataPath('profiles', id), { recursive: true, force: true });

export {
  createProfile,
  deleteProfile,
  listProfiles,
  loadProfile,
  updateProfile
};
