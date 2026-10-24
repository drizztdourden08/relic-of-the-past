/* @layer bridge-wasm @kind types */
import type { ClientMessage, DecodeOutcome } from '@drizztdourden08/archipelia-lobby-protocol';

type LobbyLinkHandlers = {
  onOpen: (url: string) => void;
  onMessage: (outcome: DecodeOutcome) => void;
  onClose: (opened: boolean) => void;
};

type LobbyLink = {
  send: (message: ClientMessage) => void;
  sendText: (raw: string) => void;
  nextSeq: () => number;
  setMaxBytes: (bytes: number) => void;
  close: () => void;
};

export type { LobbyLink, LobbyLinkHandlers };
