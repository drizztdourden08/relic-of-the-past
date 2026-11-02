/* @layer bridge-wasm @kind logic */
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';
import { startJoin } from '../join/start-join';
import { isLiveMembership } from '../membership/is-live-membership';
import type { ArchipeliaMembership } from '../membership/membership.type';
import { readMembership } from '../membership/read-membership';
import { writeMembership } from '../membership/write-membership';
import { lobbyWatch } from './lobby-watch';

const resuming = new Set<string>();

const unsupported = (membership: ArchipeliaMembership): ArchipeliaMembership => {
  const { token: _dropped, ...rest } = membership;
  return { ...rest, state: { kind: 'gone', reason: 'unsupported' }, updatedAt: Date.now() };
};

const resumeStored = async (profile: Profile): Promise<void> => {
  const membership = await readMembership(profile.id);
  if (membership === null || profile.randomizer === undefined) return;
  useLobbyStatusStore.getState().setMember(profile.id, membership);
  if (membership.token === undefined || !isLiveMembership(membership) || lobbyWatch.isWatched(profile.id)) return;
  const { server, code, ap, token } = membership;
  const started = await startJoin({ server, code, ap, config: profile.randomizer, token });
  if ('session' in started) {
    lobbyWatch.adopt(profile.id, started.session, membership);
    return;
  }
  const gone = unsupported(membership);
  useLobbyStatusStore.getState().setMember(profile.id, gone);
  await writeMembership(profile.id, gone);
};

const resumeMembership = async (profile: Profile): Promise<void> => {
  if (resuming.has(profile.id)) return;
  resuming.add(profile.id);
  try {
    await resumeStored(profile);
  } finally {
    resuming.delete(profile.id);
  }
};

export { resumeMembership };
