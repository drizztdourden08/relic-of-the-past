/* @layer bridge-wasm @kind types */
import type { ClientMessage, ProtocolMessage } from '@drizztdourden08/archipelia-lobby-protocol';
import type { CreateSocket } from '../../ap-socket.type';
import type { LobbyFailure } from '../failure';

type LobbyRequestDeps = {
  createSocket?: CreateSocket;
  timeoutMs?: number;
  protocolVersions?: number[];
};

type ProtocolOffer = { name: string; versions: number[] };

interface LobbyRequestSpec<R> {
  server: string;
  deps: LobbyRequestDeps;
  build: (seq: number, protocol: ProtocolOffer) => ClientMessage;
  pick: (message: ProtocolMessage) => R | null;
  failed: (failure: LobbyFailure) => R;
}

export type { LobbyRequestSpec };
