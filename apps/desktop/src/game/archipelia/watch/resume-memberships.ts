/* @layer bridge-wasm @kind logic */
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';
import { startJoin } from '../join/start-join';
import { WAITING_KINDS } from '../membership/membership.constants';
import type { ArchipeliaMembership } from '../membership/membership.type';
import { readMembership } from '../membership/read-membership';
import { writeMembership } from '../membership/write-membership';
import { lobbyWatch } from './lobby-watch';

const unsupported = (membership: ArchipeliaMembership): ArchipeliaMembership => {
  const { token: _dropped, ...rest } = membership;
  return { ...rest, state: { kind: 'gone', reason: 'unsupported' }, updatedAt: Date.now() };
};

const resumeOne = async (profile: Profile): Promise<void> => {
  const membership = await readMembership(profile.id);
  if (membership === null || profile.randomizer === undefined) return;
  useLobbyStatusStore.getState().setMember(profile.id, membership);
  if (membership.token === undefined || !WAITING_KINDS.includes(membership.state.kind) || lobbyWatch.isWatched(profile.id)) return;
  const { server, code, ap, token } = membership;
  const session = await startJoin({ server, code, ap, config: profile.randomizer, token });
  if (session !== null) {
    lobbyWatch.adopt(profile.id, session, membership);
    return;
  }
  const gone = unsupported(membership);
  useLobbyStatusStore.getState().setMember(profile.id, gone);
  await writeMembership(profile.id, gone);
};

const resumeMemberships = async (profiles: readonly Profile[]): Promise<void> => {
  const members = profiles.filter((profile) => profile.randomizer?.mode === 'archipelia');
  await Promise.all(members.map(resumeOne));
};

export { resumeMemberships };
