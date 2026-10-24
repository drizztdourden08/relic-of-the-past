/* @layer bridge-wasm @kind types */
import type { SlotsUpdate } from '../join/join-config.type';
import type { LobbyEvent } from './lobby-event.type';
import type { LobbyJoinState } from './lobby-state.type';

type LobbyListener = (event: LobbyEvent, state: LobbyJoinState) => void;

type LobbySession = {
  readonly state: LobbyJoinState;
  readonly ended: Promise<LobbyJoinState>;
  subscribe: (listener: LobbyListener) => () => void;
  setReady: (ready: boolean) => void;
  setSlots: (update: SlotsUpdate) => void;
  downloadFile: (fileId: string) => Promise<Uint8Array>;
  leave: () => void;
  close: () => void;
};

export type { LobbyListener, LobbySession };
