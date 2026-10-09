/* @layer bridge-wasm @kind logic */
import { listProfiles, readConfig } from '@app/storage/profile-store';
import { mergeSettings as merge } from '@rotp/game-core';
import { loadMsuPack } from './load-msu-pack';
import { msuPackSessionOwner } from '@rotp/msu';

const reloadMsuForProfile = async (profileId: string): Promise<boolean> => {
  if (msuPackSessionOwner.profileId !== profileId) return false;
  const profile = (await listProfiles()).find((p) => p.id === profileId);
  if (!profile) return false;
  const saved = await readConfig(profileId);
  await loadMsuPack(profile, merge((saved ?? {}) as Parameters<typeof merge>[0]));
  return true;
};

export { reloadMsuForProfile };
