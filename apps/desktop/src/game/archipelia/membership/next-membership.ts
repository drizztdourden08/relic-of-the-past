/* @layer bridge-wasm @kind logic */
import type { LobbyEvent, LobbyFailure, LobbyJoinState } from '@rotp/randomizer';
import { GONE_CODES } from './membership.constants';
import type { ArchipeliaMembership, MembershipState, MembershipStep } from './membership.type';


const withState = (m: ArchipeliaMembership, state: MembershipState, dropToken = false): ArchipeliaMembership => {
  const { token, ...rest } = m;
  return { ...rest, ...(dropToken || token === undefined ? {} : { token }), state, updatedAt: Date.now() };
};

const admissionState = (admission: string | null, reason: string | null): MembershipState | null => {
  if (admission === 'pending') return { kind: 'pending' };
  if (admission === 'approved') return { kind: 'approved' };
  if (admission === 'refused' || admission === 'removed') return { kind: 'refused', reason: reason ?? '' };
  return null;
};

const failureMembership = (m: ArchipeliaMembership, failure: LobbyFailure): ArchipeliaMembership => {
  if (failure.code === 'refused') return withState(m, { kind: 'refused', reason: failure.message }, true);
  const gone = GONE_CODES[failure.code];
  return gone === undefined ? m : withState(m, { kind: 'gone', reason: gone }, true);
};

const fromWelcome = (m: ArchipeliaMembership, state: LobbyJoinState): ArchipeliaMembership => ({
  ...m,
  memberId: state.memberId ?? m.memberId,
  lobbyName: state.lobby?.name ?? m.lobbyName,
  ...(state.token === null ? {} : { token: state.token }),
});

const admitted = (m: ArchipeliaMembership, next: MembershipState | null): ArchipeliaMembership =>
  (next === null ? m : withState(m, next, next.kind === 'refused'));

const nextState = (m: ArchipeliaMembership, event: LobbyEvent, state: LobbyJoinState): ArchipeliaMembership => {
  if (event.type === 'welcome') return admitted(fromWelcome(m, state), admissionState(state.admission, state.admissionReason));
  if (event.type === 'admission') return admitted(m, admissionState(event.state, event.reason));
  if (event.type === 'generation-failed') return withState(m, { kind: 'failed', message: event.message });
  if (event.type === 'progress') return m.state.kind === 'failed' ? withState(m, { kind: 'approved' }) : m;
  if (event.type === 'started') return withState(m, { kind: 'started' });
  return event.type === 'failed' ? failureMembership(m, event.failure) : m;
};

const nextMembership = (m: ArchipeliaMembership, event: LobbyEvent, state: LobbyJoinState): MembershipStep => ({
  membership: nextState(m, event, state),
  promote: event.type === 'started' ? event.started : null,
  room: event.type === 'room' ? event.address : null,
});

export { nextMembership };
