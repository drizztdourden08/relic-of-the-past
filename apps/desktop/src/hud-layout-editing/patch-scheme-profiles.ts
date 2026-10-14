/* @layer renderer-components @kind logic */
import { migrateProfilesLoudly } from '@rotp/input-mapping';
import { readInputProfiles, writeInputProfiles } from '@app/storage/profile-data-store';
import { activeProfileId } from '@app/hud/active-profile';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import type { ModernBindings } from '@rotp/game-data';
import type { InputProfile } from '@rotp/input-mapping';

const patchSchemeProfiles = async (
  schemeId: string,
  change: (modern: ModernBindings) => ModernBindings,
): Promise<InputProfile[] | null> => {
  const profileId = await activeProfileId();
  if (!profileId) return null;
  const loaded = migrateProfilesLoudly(await readInputProfiles(profileId));
  const next = loaded.map((profile) => (profile.id === schemeId && profile.modern
    ? { ...profile, modern: change(profile.modern), modifiedAt: Date.now() }
    : profile));
  await writeInputProfiles(profileId, next);
  const manager = getInputManager();
  manager.setProfiles(next);
  const active = next.find((profile) => profile.id === manager.getProfile()?.id);
  if (active) manager.setProfile(active);
  return next;
};

export { patchSchemeProfiles };
