/* @layer renderer-lib @kind hook */
import { useCallback } from 'react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { loadProfile } from '@drizztdourden08/brock-react';
import { LocalizedError } from '@app/storage/localized-error';
import { updateProfile } from '@app/storage/profile-store';
import { reconnectProfileSession } from '@app/game/randomizer-client';
import { useProfileConnectionStore } from '@app/stores/profile-connection-store';
import { applyConnectionPatch } from '@app/profiles/connection-patch/randomizer-connection-patch';
import type { RandomizerConnectionPatch } from '@app/profiles/types';
import type { ProfileConnection } from './use-profile-connection.type';

const useProfileConnection = (profile: Profile | null): ProfileConnection => {
  const profileId = profile?.id ?? null;
  const saved = useProfileConnectionStore((state) => (profileId === null ? undefined : state.saved[profileId]));
  const setSaved = useProfileConnectionStore((state) => state.setSaved);
  const config = saved ?? profile?.randomizer ?? null;

  const saveConnection = useCallback(async (patch: RandomizerConnectionPatch) => {
    if (profileId === null) throw new LocalizedError(msg('randomizer:profile-connection.no-profile'));
    const stored = await loadProfile(profileId);
    if (!stored) throw new LocalizedError(msg('randomizer:profile-connection.profile-gone'));
    const randomizer = applyConnectionPatch(stored.randomizer, patch);
    const updated = await updateProfile(profileId, { randomizer });
    if (!updated?.randomizer) throw new LocalizedError(msg('randomizer:profile-connection.profile-gone'));
    setSaved(profileId, updated.randomizer);
    reconnectProfileSession(profileId, updated.randomizer);
  }, [profileId, setSaved]);

  return { config, saveConnection };
};

export { useProfileConnection };
