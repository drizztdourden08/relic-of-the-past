/* @layer tests @kind test */
import { DEFAULT_LIMITS, decodeMessage, encodeMessage } from '@drizztdourden08/archipelia-lobby-protocol';
import type { ClientMessage, DecodeOutcome } from '@drizztdourden08/archipelia-lobby-protocol';
import { createBrowserSocket, lobbyUrlCandidates, openSocketLink } from '@drizztdourden08/brock-randomizer/archipelago';

type RawLobbyLink = {
  send: (message: ClientMessage) => void;
  sendText: (raw: string) => void;
};

type RawLobbyLinkHandlers = {
  onOpen: () => void;
  onMessage: (outcome: DecodeOutcome) => void;
  onClose: () => void;
};

const openRawLobbyLink = (server: string, handlers: RawLobbyLinkHandlers): RawLobbyLink => {
  const maxBytes = DEFAULT_LIMITS.maxMessageBytes;
  const socket = openSocketLink(lobbyUrlCandidates(server), createBrowserSocket, {
    onOpen: handlers.onOpen,
    onMessage: (text) => handlers.onMessage(decodeMessage(text, { direction: 's2c', maxBytes })),
    onClose: handlers.onClose,
  });
  return {
    send: (message) => socket.send(encodeMessage(message, maxBytes)),
    sendText: (raw) => socket.send(raw),
  };
};

export { openRawLobbyLink };
export type { RawLobbyLink };
