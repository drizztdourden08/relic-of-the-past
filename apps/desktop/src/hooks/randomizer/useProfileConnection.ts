/* @layer renderer-lib @kind hook */
import { useCallback } from 'react';
import { loadProfile } from '@drizztdourden08/brock-react';
import { updateProfile } from '@app/lib/storage/profile-store';
import { reconnectProfileSession } from '@app/lib/game/randomizer-client';
import { useProfileConnectionStore } from '@app/stores/profile-connection-store';
import { applyConnectionPatch } from '@shared/storage/randomizer-connection-patch';
import type { RandomizerConnectionPatch } from '@shared/types/profile';
import type { ProfileConnection } from './use-profile-connection.type';

const useProfileConnection = (profile: Profile | null): ProfileConnection => {
  const profileId = profile?.id ?? null;
  const saved = useProfileConnectionStore((state) => (profileId === null ? undefined : state.saved[profileId]));
  const setSaved = useProfileConnectionStore((state) => state.setSaved);
  const config = saved ?? profile?.randomizer ?? null;

  const saveConnection = useCallback(async (patch: RandomizerConnectionPatch) => {
    if (profileId === null) throw new Error('No profile is open.');
    const stored = await loadProfile(profileId);
    if (!stored) throw new Error('The profile is gone.');
    const randomizer = applyConnectionPatch(stored.randomizer, patch);
    const updated = await updateProfile(profileId, { randomizer });
    if (!updated?.randomizer) throw new Error('The profile is gone.');
    setSaved(profileId, updated.randomizer);
    await reconnectProfileSession(profileId, updated.randomizer);
  }, [profileId, setSaved]);

  return { config, saveConnection };
};

export { useProfileConnection };
export type { ProfileConnection };
