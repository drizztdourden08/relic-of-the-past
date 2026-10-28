/* @layer tests @kind test */
import { joinLobby, lobbyInfo } from '../../src/client/lobby';
import type { LobbyEvent, LobbyJoinState, LobbySession } from '../../src/client/lobby';
import { firstMessage, watch } from './lobby-harness.keep.test';
import type { Driver, play } from './lobby-harness.keep.test';

const until = (session: LobbySession, test: (state: LobbyJoinState) => boolean, ms = 8000): Promise<LobbyJoinState> =>
  new Promise((resolve, reject) => {
    if (test(session.state)) {
      resolve(session.state);
      return;
    }
    const timer = setTimeout(() => {
      off();
      reject(new Error(`timed out in status ${session.state.status}: ${JSON.stringify(session.state.failure)}`));
    }, ms);
    const off = session.subscribe((_event, state) => {
      if (!test(state)) return;
      clearTimeout(timer);
      off();
      resolve(state);
    });
  });

const joined = (react?: (event: LobbyEvent, state: LobbyJoinState, session: LobbySession) => void, patch?: object): Driver =>
  (tools) => {
    const events: LobbyEvent[] = [];
    const session = joinLobby({ ...tools.config(), ...patch });
    watch(session, events, (event, state) => react?.(event, state, session));
    return Promise.resolve({ sessions: [session], events });
  };

const endsWith = (test: (state: LobbyJoinState) => boolean, patch?: object): Driver => async (tools) => {
  const drive = await joined(undefined, patch)(tools);
  const [session] = drive.sessions;
  if (session) await until(session, test);
  return drive;
};

const infoDriver = (): Driver => async (tools) => {
  const hello = firstMessage(tools.scenario, 'lobby.info') as { lobby: { code: string }; protocol: { versions: number[] } };
  const result = await lobbyInfo(tools.server, hello.lobby.code, { protocolVersions: hello.protocol.versions });
  return { sessions: [], events: [], extra: result };
};

const expectOk = (outcome: Awaited<ReturnType<typeof play>>) => {
  expect(outcome.result.failure ?? null).toBeNull();
  expect(outcome.result.ok).toBe(true);
};

const finalState = (outcome: Awaited<ReturnType<typeof play>>): LobbyJoinState => {
  const [state] = outcome.states;
  if (!state) throw new Error('no session');
  return state;
};

export { endsWith, expectOk, finalState, infoDriver, joined, until };
