/* @layer bridge-wasm @kind logic */
import { loadProfile } from '@drizztdourden08/brock-react';
import type { LobbyStart } from '@rotp/randomizer';
import { updateProfile } from '@app/storage/profile-store';
import { log } from '@app/log-bus';
import { promotionOf } from '../membership/promotion-of';

const promoteProfile = async (profileId: string, start: LobbyStart, lobbyServer: string): Promise<void> => {
  const profile = await loadProfile(profileId);
  if (!profile?.randomizer) return;
  await updateProfile(profileId, { randomizer: promotionOf(profile.randomizer, start, lobbyServer) });
  log.app(`Archipelia room started for ${profile.name}`);
};

export { promoteProfile };
