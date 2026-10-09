/* @layer renderer-lib @kind logic */
import { getActiveProfileId } from '@app/lib/game';
import { getAppState } from '@app/lib/storage/profile-store';
import { toldProfile } from './told-profile';
import { pinnedProfileId } from './pinned-profile-id';

const activeProfileId = async (): Promise<string | null> => {
  if (toldProfile.id) return toldProfile.id;
  const running = getActiveProfileId();
  if (running) return running;
  try {
    return (await pinnedProfileId()) ?? (await getAppState()).lastProfileId;
  } catch {
    return null;
  }
};

export { activeProfileId };
