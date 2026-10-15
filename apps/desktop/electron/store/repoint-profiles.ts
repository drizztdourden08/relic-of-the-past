/* @layer electron-main @kind logic */
import { readdir } from 'fs/promises';
import { getUserDataPath, readJsonFile, writeJsonFile } from '@drizztdourden08/brock-electron/main';
import type { Profile } from '@drizztdourden08/brock-core/storage';
import type { SelectedPack } from './repoint-profiles.type';

const profileFile = (id: string): string => getUserDataPath('profiles', id, 'profile.json');

const configFile = (id: string): string => getUserDataPath('profiles', id, 'config.json');

const listProfiles = async (): Promise<Profile[]> => {
  const ids = await readdir(getUserDataPath('profiles')).catch(() => []);
  const profiles: Profile[] = [];
  for (const id of ids) {
    const profile = await readJsonFile<Profile | null>(profileFile(id), null);
    if (profile) profiles.push(profile);
  }
  return profiles.sort((a, b) => b.lastPlayed - a.lastPlayed);
};

const repointOne = async (profile: Profile, pack: SelectedPack, replacement: string | null): Promise<boolean> => {
  const { kind, installedName } = pack;
  const value = replacement ?? undefined;
  if (kind === 'music') {
    if (profile.msuPack !== installedName) return false;
    await writeJsonFile(profileFile(profile.id), { ...profile, msuPack: value });
    return true;
  }
  if (kind === 'language') {
    if (profile.language !== installedName) return false;
    await writeJsonFile(profileFile(profile.id), { ...profile, language: value });
    return true;
  }
  const config = await readJsonFile<Record<string, unknown> | null>(configFile(profile.id), null);
  if (config?.linkSprite !== installedName) return false;
  await writeJsonFile(configFile(profile.id), { ...config, linkSprite: replacement });
  return true;
};

const repointProfiles = async (pack: SelectedPack, replacement: string | null): Promise<string[]> => {
  const changed: string[] = [];
  for (const profile of await listProfiles()) {
    if (await repointOne(profile, pack, replacement)) changed.push(profile.id);
  }
  return changed;
};

export { repointProfiles };
