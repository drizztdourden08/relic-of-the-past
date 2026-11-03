/* @layer bridge-wasm @kind logic */
import { lobbyRequest } from '../request/lobby-request';
import type { LobbyBrowseDeps, LobbyBrowseResult } from './lobby-browse.type';

const lobbyBrowse = (server: string, deps: LobbyBrowseDeps = {}): Promise<LobbyBrowseResult> =>
  lobbyRequest<LobbyBrowseResult>({
    server,
    deps,
    build: (seq, protocol) => ({ type: 'lobby.browse', seq, protocol }),
    pick: (message) => (message.type === 'lobby.browse.reply' ? { ok: true, lobbies: message.lobbies } : null),
    failed: (failure) => ({ ok: false, failure }),
  });

export { lobbyBrowse };
