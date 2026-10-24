/* @layer bridge-wasm @kind logic */
import type { LobbyEvent, LobbyJoinState, LobbySession } from '@rotp/randomizer';
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';
import { WAITING_KINDS } from '../membership/membership.constants';
import type { ArchipeliaMembership } from '../membership/membership.type';
import { nextMembership } from '../membership/next-membership';
import { writeMembership } from '../membership/write-membership';
import { followRoom } from './follow-room';
import type { Watched } from './lobby-watch.type';
import { promoteProfile } from './promote-profile';

const watched = new Map<string, Watched>();

const liveOf = (state: LobbyJoinState) => ({
  connected: !state.reconnecting && state.status !== 'connecting' && state.status !== 'closed',
  progress: state.progress === null ? null : { phase: state.progress.phase, fraction: state.progress.fraction },
});

const release = (profileId: string): void => {
  const current = watched.get(profileId);
  if (current === undefined) return;
  current.stop();
  current.session.close();
  watched.delete(profileId);
};

const adopt = (profileId: string, session: LobbySession, membership: ArchipeliaMembership): void => {
  release(profileId);
  const store = useLobbyStatusStore.getState();
  let current = membership;
  store.setMember(profileId, current);
  const apply = (event: LobbyEvent, state: LobbyJoinState): void => {
    store.setLive(profileId, liveOf(state));
    const step = nextMembership(current, event, state);
    if (step.membership !== current) {
      current = step.membership;
      store.setMember(profileId, current);
      void writeMembership(profileId, current);
    }
    if (step.promote !== null) void promoteProfile(profileId, step.promote);
    if (step.room !== null) void followRoom(profileId, step.room);
    if (current.state.kind !== 'started' && !WAITING_KINDS.includes(current.state.kind)) release(profileId);
  };
  watched.set(profileId, { session, stop: session.subscribe(apply) });
  store.setLive(profileId, liveOf(session.state));
};

const forget = (profileId: string): void => {
  watched.get(profileId)?.session.leave();
  release(profileId);
  useLobbyStatusStore.getState().drop(profileId);
};

const lobbyWatch = { adopt, forget, isWatched: (profileId: string): boolean => watched.has(profileId) };

export { lobbyWatch };
