/* @layer bridge-wasm @kind logic */
import { loadProfile } from '@drizztdourden08/brock-react';
import { updateProfile } from '@app/storage/profile-store';
import { movedRoomUrlsOf } from '../membership/moved-room-urls-of';

const followRoom = async (profileId: string, address: string, lobbyServer: string): Promise<void> => {
  const profile = await loadProfile(profileId);
  if (profile?.randomizer?.mode !== 'online') return;
  const { fallbackServerUrl, ...rest } = profile.randomizer;
  const urls = movedRoomUrlsOf(lobbyServer, address, fallbackServerUrl !== undefined);
  await updateProfile(profileId, { randomizer: { ...rest, ...urls } });
};

export { followRoom };
