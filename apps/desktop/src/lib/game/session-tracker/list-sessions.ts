/* @layer bridge-wasm @kind logic */
import type { PlaySession } from '@rotp/game-core';
import { listSessions as listSessionsStore } from '../../storage/profile-data-store';

const listSessions = async (profileId: string): Promise<PlaySession[]> => {
  try {
    return await listSessionsStore(profileId);
  } catch {
    return [];
  }
};

export { listSessions };
