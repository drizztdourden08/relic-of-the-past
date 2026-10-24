/* @layer bridge-wasm @kind types */
import type { LobbyInfoReply } from '@drizztdourden08/archipelia-lobby-protocol';
import type { CreateSocket } from '../../ap-socket.type';
import type { LobbyFailure } from '../failure';

type LobbyInfo = Omit<LobbyInfoReply, 'type' | 're'>;

type LobbyInfoResult = { ok: true; info: LobbyInfo } | { ok: false; failure: LobbyFailure };

type LobbyInfoDeps = {
  createSocket?: CreateSocket;
  timeoutMs?: number;
  protocolVersions?: number[];
};

export type { LobbyInfo, LobbyInfoDeps, LobbyInfoResult };
