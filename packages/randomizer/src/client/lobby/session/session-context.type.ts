/* @layer bridge-wasm @kind types */
import type { CreateSocket } from '../../ap-socket.type';
import type { Reconnector } from '../../reconnect';
import type { ListenerSet } from '../../listener-set.type';
import type { JoinConfig, WorldInput } from '../join/join-config.type';
import type { PreparedJoin } from '../join/prepared-join.type';
import type { LinkDownload } from '../files/download.type';
import type { LobbyLink } from '../link/lobby-link.type';
import type { Uploader } from '../upload/uploader.type';
import type { LobbyEvent } from './lobby-event.type';
import type { LobbyJoinState } from './lobby-state.type';

type WireState = {
  infoSeq: number | null;
  readySeq: number | null;
  readySent: boolean;
  readyRetried: boolean;
  slotsSeq: number | null;
  awaitingSlots: boolean;
  pendingPrepared: PreparedJoin | null;
  pendingWorld: WorldInput | null;
  stateSeen: boolean;
  uploadsStarted: boolean;
  need: string[];
  chunkBytes: number;
};

type SessionCtx = {
  config: JoinConfig;
  createSocket: CreateSocket;
  maxReconnects: number;
  world: WorldInput;
  prepared: PreparedJoin;
  state: LobbyJoinState;
  listeners: ListenerSet<[LobbyEvent, LobbyJoinState]>;
  link: LobbyLink | null;
  wire: WireState;
  uploader: Uploader | null;
  downloads: Map<number, LinkDownload>;
  reconnector: Reconnector;
  attempts: number;
  finished: boolean;
  settle: (state: LobbyJoinState) => void;
};

export type { SessionCtx, WireState };
