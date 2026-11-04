/* @layer bridge-wasm @kind logic */
import type { LobbyRef } from '@drizztdourden08/archipelia-lobby-protocol';
import { invalidCode } from '../failure';
import { formatLobbyRef } from '../ref/format-lobby-ref';
import { lobbyRequest } from '../request/lobby-request';
import type { LobbyInfoDeps, LobbyInfoResult } from './lobby-info.type';

const lobbyInfo = (server: string, lobby: LobbyRef, deps: LobbyInfoDeps = {}): Promise<LobbyInfoResult> => {
  const ref = formatLobbyRef(lobby);
  if (ref === null) return Promise.resolve({ ok: false, failure: invalidCode() });
  return lobbyRequest<LobbyInfoResult>({
    server,
    deps,
    build: (seq, protocol) => ({ type: 'lobby.info', seq, protocol, lobby: ref }),
    pick: (message) => {
      if (message.type !== 'lobby.info.reply') return null;
      const { type: _type, re: _re, ...info } = message;
      return { ok: true, info };
    },
    failed: (failure) => ({ ok: false, failure }),
  });
};

export { lobbyInfo };
