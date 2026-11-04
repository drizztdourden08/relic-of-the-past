/* @layer bridge-wasm @kind types */
import type { BrowsedLobby } from '@drizztdourden08/archipelia-lobby-protocol';
import type { CreateSocket } from '../../ap-socket.type';
import type { LobbyFailure } from '../failure';

type LobbyBrowseResult = { ok: true; lobbies: BrowsedLobby[] } | { ok: false; failure: LobbyFailure };

type LobbyBrowseDeps = {
  createSocket?: CreateSocket;
  timeoutMs?: number;
  protocolVersions?: number[];
};

export type { LobbyBrowseDeps, LobbyBrowseResult };
