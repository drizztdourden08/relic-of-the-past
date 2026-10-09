/* @layer electron-main @kind logic */
import { mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import type { Profile, CreateProfileOptions } from '@shared/types/profile';
import { getUserDataPath } from '../../lib/paths';
import { writeJson } from '../../lib/json-store';
import { profilePath } from './profile-path';

const createProfile = async (opts: CreateProfileOptions): Promise<Profile> => {
  const { name, romFile, language, msuPack, randomizer } = opts;
  const id = randomUUID().slice(0, 8);
  const now = Date.now();
  const profile: Profile = { id, name, romFile, created: now, lastPlayed: now };
  if (language) profile.language = language;
  if (msuPack) profile.msuPack = msuPack;
  if (randomizer) profile.randomizer = randomizer;

  await mkdir(getUserDataPath('profiles', id, 'saves'), { recursive: true });
  await writeJson(profilePath(id), profile);
  await writeJson(getUserDataPath('profiles', id, 'config.json'), {});

  return profile;
};

export { createProfile };
