/* @layer bridge-wasm @kind logic */
import { loadProfile } from '@drizztdourden08/brock-react';
import { updateProfile } from '@app/storage/profile-store';

const followRoom = async (profileId: string, address: string): Promise<void> => {
  const profile = await loadProfile(profileId);
  if (profile?.randomizer?.mode !== 'online') return;
  await updateProfile(profileId, { randomizer: { ...profile.randomizer, serverUrl: address } });
};

export { followRoom };
