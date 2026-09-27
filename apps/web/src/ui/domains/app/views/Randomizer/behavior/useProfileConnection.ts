/* @layer renderer-components @kind hook */
/**
 * The active profile's randomizer config as this page shows it, with the connection edit
 * applied. Saving writes the profile (only connection keys pass, profile-patch.ts) and
 * reconnects the session on the new values at once. The app's profile object is left alone:
 * the next boot reads the profile from storage anyway.
 */
import { useCallback, useState } from 'react';
import { updateProfile } from '@app/lib/storage/profile-store';
import { reconnectProfileSession } from '@app/lib/game/randomizer-client';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface EditedConfig {
  profileId: string;
  config: ProfileRandomizerConfig;
}

interface ProfileConnection {
  config: ProfileRandomizerConfig | null;
  saveConnection: (patch: RandomizerConnectionPatch) => Promise<void>;
}

const useProfileConnection = (profile: Profile | null): ProfileConnection => {
  const [edited, setEdited] = useState<EditedConfig | null>(null);
  const profileId = profile?.id ?? null;
  const config = edited !== null && edited.profileId === profileId ? edited.config : profile?.randomizer ?? null;

  const saveConnection = useCallback(async (patch: RandomizerConnectionPatch) => {
    if (profileId === null) throw new Error('No profile is open.');
    const updated = await updateProfile(profileId, { randomizerConnection: patch });
    if (!updated?.randomizer) throw new Error('The profile is gone.');
    setEdited({ profileId, config: updated.randomizer });
    await reconnectProfileSession(profileId, updated.randomizer);
  }, [profileId]);

  return { config, saveConnection };
};

export { useProfileConnection };
export type { ProfileConnection };
