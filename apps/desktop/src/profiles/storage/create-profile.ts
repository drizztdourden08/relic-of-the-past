/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { CreateProfileOptions, Profile } from '@app/profiles/types';
import { newId, writeJson } from '@drizztdourden08/brock-core';
import { configFile } from './config-file';
import { profileFile } from './profile-file';

const createProfile = async (files: FileStore, opts: CreateProfileOptions): Promise<Profile> => {
  const { name, romFile, language, msuPack, randomizer } = opts;
  const id = newId();
  const now = Date.now();
  const profile: Profile = { id, name, romFile, created: now, lastPlayed: now };
  if (language) profile.language = language;
  if (msuPack) profile.msuPack = msuPack;
  if (randomizer) profile.randomizer = randomizer;
  await files.mkdir(`profiles/${id}/saves`);
  await writeJson(files, profileFile(id), profile);
  await writeJson(files, configFile(id), {});
  return profile;
};

export { createProfile };
