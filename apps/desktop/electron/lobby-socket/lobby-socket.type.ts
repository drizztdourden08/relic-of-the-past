/* @layer electron-main @kind types */
import type { SocketTransport } from '@drizztdourden08/archipelia-lobby-protocol/node';
import type { LobbySocketEvent } from '@app/ipc';

type LobbySocketPush = (event: LobbySocketEvent) => void;

type LobbySocketEntry = {
  owner: number;
  closing: boolean;
  transport: SocketTransport | null;
};

type LobbySockets = {
  open: (owner: number, id: string, url: string, push: LobbySocketPush) => void;
  send: (id: string, data: string) => void;
  close: (id: string) => void;
  closeOwnedBy: (owner: number) => void;
};

export type { LobbySocketEntry, LobbySockets };
