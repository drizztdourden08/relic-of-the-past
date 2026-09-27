/* @layer shared-storage @kind logic */
/**
 * A profile edit applied to a profile, shared by every store. A key that is ABSENT leaves the
 * field alone, NULL clears it, a value sets it: clearing written as `undefined` could not be
 * told from absent once the patch crossed a process boundary. The randomizer config is frozen
 * except for its connection (randomizer-connection-patch.ts).
 */
import { applyConnectionPatch } from './randomizer-connection-patch';
import type { Profile, ProfilePatch } from '@shared/types/profile';

/** Mutates and returns `profile`. Throws when the connection part is refused. */
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
