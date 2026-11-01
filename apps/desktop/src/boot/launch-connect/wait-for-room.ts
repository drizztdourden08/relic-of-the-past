/* @layer renderer-app @kind logic */
import { log } from '@app/log-bus';
import { listProfiles } from '@app/storage/profile-store';
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';
import { ROOM_NOTE_MS, ROOM_POLL_MS, ROOM_WAIT_MS } from './launch-connect.constants';

const pause = (ms: number): Promise<void> => new Promise((resolve) => { setTimeout(resolve, ms); });

const GIVEN_UP = new Set(['failed', 'refused', 'gone']);

/** Resolves once the lobby has started its room and the profile was promoted to an online profile, false when the lobby gives up. */
const waitForRoom = async (profileId: string): Promise<boolean> => {
  const began = Date.now();
  let noted = began;
  while (Date.now() - began < ROOM_WAIT_MS) {
    const profile = (await listProfiles()).find((candidate) => candidate.id === profileId);
    if (profile?.randomizer?.mode === 'online') return true;
    const state = useLobbyStatusStore.getState().members[profileId]?.state;
    if (state !== undefined && GIVEN_UP.has(state.kind)) {
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
