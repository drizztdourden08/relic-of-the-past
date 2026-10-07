/* @layer renderer-lib @kind hook */
/**
 * A profile's randomizer config as the screens show it, with the latest connection edit
 * applied. Saving writes the profile (only connection keys pass, profile-patch.ts), shares the
 * saved config with every other screen (profile-connection-store.ts) and reconnects the
 * session on the new values at once. The app's profile object is left alone: the next boot
 * reads the profile from storage anyway.
 */
import { useCallback } from 'react';
import { updateProfile } from '@app/lib/storage/profile-store';
import { reconnectProfileSession } from '@app/lib/game/randomizer-client';
import { useProfileConnectionStore } from '@app/stores/profile-connection-store';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ProfileConnection {
  config: ProfileRandomizerConfig | null;
  saveConnection: (patch: RandomizerConnectionPatch) => Promise<void>;
}

const useProfileConnection = (profile: Profile | null): ProfileConnection => {
  const profileId = profile?.id ?? null;
  const saved = useProfileConnectionStore((state) => (profileId === null ? undefined : state.saved[profileId]));
  const setSaved = useProfileConnectionStore((state) => state.setSaved);
  const config = saved ?? profile?.randomizer ?? null;

  const saveConnection = useCallback(async (patch: RandomizerConnectionPatch) => {
    if (profileId === null) throw new Error('No profile is open.');
    const updated = await updateProfile(profileId, { randomizerConnection: patch });
    if (!updated?.randomizer) throw new Error('The profile is gone.');
    setSaved(profileId, updated.randomizer);
    await reconnectProfileSession(profileId, updated.randomizer);
  }, [profileId, setSaved]);

  return { config, saveConnection };
};

export { useProfileConnection };
export type { ProfileConnection };
