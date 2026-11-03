/* @layer renderer-app @kind logic */
import { log } from '@app/log-bus';
import { listProfiles } from '@app/storage/profile-store';
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';
import { LOBBY_GIVEN_UP_STATES, ROOM_NOTE_MS, ROOM_POLL_MS, ROOM_WAIT_MS } from './launch-connect.constants';

const pause = (ms: number): Promise<void> => new Promise((resolve) => { setTimeout(resolve, ms); });

const isOnlineProfile = async (profileId: string): Promise<boolean> =>
  (await listProfiles()).find((candidate) => candidate.id === profileId)?.randomizer?.mode === 'online';

const lobbyStateOf = (profileId: string) => useLobbyStatusStore.getState().members[profileId]?.state;

const waitForRoom = async (profileId: string): Promise<boolean> => {
  const began = Date.now();
  let noted = began;
  while (Date.now() - began < ROOM_WAIT_MS) {
    if (await isOnlineProfile(profileId)) return true;
    const state = lobbyStateOf(profileId);
    if (state !== undefined && LOBBY_GIVEN_UP_STATES.has(state.kind)) {
      log.app(`[LaunchConnect] The lobby gave up on this profile (${state.kind})`, 'error');
      return false;
    }
    if (Date.now() - noted >= ROOM_NOTE_MS) {
      noted = Date.now();
      log.app(`[LaunchConnect] Waiting for the lobby to start its room (${state?.kind ?? 'unknown'})`);
    }
    await pause(ROOM_POLL_MS);
  }
  log.app('[LaunchConnect] The lobby never started its room', 'error');
  return false;
};

export { waitForRoom };
