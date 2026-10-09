/* @layer renderer-lib @kind logic */
import { updateProfile as updateStoredProfile, useProfilesStore } from '@drizztdourden08/brock-react';
import type { Profile, ProfilePatch } from '@drizztdourden08/brock-core';

const updateProfile = async (id: string, patch: ProfilePatch): Promise<Profile | null> => {
  const updated = await updateStoredProfile(id, patch);
  const store = useProfilesStore.getState();
  if (updated && store.active?.id === id) store.setActive(updated);
  await store.refresh();
  return updated;
};

export { updateProfile };
