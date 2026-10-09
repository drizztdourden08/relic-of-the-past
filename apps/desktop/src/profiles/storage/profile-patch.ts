/* @layer shared-storage @kind logic */
import { applyConnectionPatch } from '../connection-patch/randomizer-connection-patch';
import type { Profile, ProfilePatch } from '@app/profiles/types';

const applyProfilePatch = (profile: Profile, patch: ProfilePatch): Profile => {
  const { name, language, msuPack, randomizerConnection } = patch;
  if (randomizerConnection !== undefined) {
    profile.randomizer = applyConnectionPatch(profile.randomizer, randomizerConnection);
  }
  if (name != null) profile.name = name;
  if (language !== undefined) profile.language = language ?? undefined;
  if (msuPack !== undefined) profile.msuPack = msuPack ?? undefined;
  return profile;
};

export { applyProfilePatch };
