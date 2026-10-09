/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir, readdir } from 'fs/promises';
import type { Profile } from '@shared/types/profile';
import { getUserDataPath } from '../../lib/paths';
import { readJson } from '../../lib/json-store';

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

export { listProfiles };
