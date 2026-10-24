/* @layer bridge-wasm @kind logic */
import type { LobbyEvent, LobbyJoinState, LobbySession, UploadProgress } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { formErrorOf } from '../check/form-error-of';
import type { LobbyCheckOk } from '../check/lobby-check.type';
import type { ArchipeliaMembership } from '../membership/membership.type';
import type { JoinOutcome } from './join-input.type';
import { startJoin } from './start-join';

const sentOf = (uploads: readonly UploadProgress[]): number => {
  const total = uploads.reduce((sum, upload) => sum + upload.size, 0);
  return total === 0 ? 0 : uploads.reduce((sum, upload) => sum + (upload.done ? upload.size : upload.sent), 0) / total;
};

const membershipOf = (check: LobbyCheckOk, state: LobbyJoinState): ArchipeliaMembership => ({
  server: check.server,
  code: check.code,
  ap: check.ap,
  lobbyName: state.lobby?.name ?? check.name,
  memberId: state.memberId ?? '',
  ...(state.token === null ? {} : { token: state.token }),
  state: state.admission === 'approved' ? { kind: 'approved' } : { kind: 'pending' },
  updatedAt: Date.now(),
});

const endOf = (check: LobbyCheckOk, session: LobbySession, event: LobbyEvent, state: LobbyJoinState): JoinOutcome | null => {
  if (event.type === 'failed') return { ok: false, error: formErrorOf(event.failure, check.server) };
  if (event.type === 'closed') return { ok: false, error: formErrorOf({ code: 'closed', message: '' }, check.server) };
  if (event.type === 'problem' && event.problem.code === 'slot-name-taken') {
    session.leave();
    return { ok: false, error: formErrorOf(event.problem, check.server) };
  }
  if (state.uploadsDone && state.token !== null) return { ok: true, session, membership: membershipOf(check, state) };
  return null;
};

const joinFromForm = async (
  check: LobbyCheckOk, config: ProfileRandomizerConfig, onProgress: (fraction: number) => void,
): Promise<JoinOutcome> => {
  const session = await startJoin({ server: check.server, code: check.code, ap: check.ap, config });
  if (session === null) return { ok: false, error: `The bundled build for Archipelago ${check.ap} is missing.` };
  return new Promise((resolve) => {
    const stop = session.subscribe((event, state) => {
      if (state.uploads.length > 0) onProgress(sentOf(state.uploads));
      const end = endOf(check, session, event, state);
      if (end === null) return;
      stop();
      resolve(end);
    });
  });
};

export { joinFromForm };
