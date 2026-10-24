/* @layer bridge-wasm @kind logic */
import { DEFAULT_LIMITS, decodeMessage, encodeMessage } from '@archipelia/lobby-protocol';
import type { CreateSocket } from '../../ap-socket.type';
import { openSocketLink } from '../../online-socket';
import { lobbyUrlCandidates } from '../address/lobby-url-candidates';
import type { LobbyLink, LobbyLinkHandlers } from './lobby-link.type';

const openLobbyLink = (server: string, createSocket: CreateSocket, handlers: LobbyLinkHandlers): LobbyLink => {
  let maxBytes = DEFAULT_LIMITS.maxMessageBytes;
  let seq = 0;
  const socket = openSocketLink(lobbyUrlCandidates(server), createSocket, {
    onOpen: handlers.onOpen,
    onMessage: (text) => handlers.onMessage(decodeMessage(text, { direction: 's2c', maxBytes })),
    onClose: handlers.onClose,
  });
  return {
    send: (message) => socket.send(encodeMessage(message, maxBytes)),
    sendText: (raw) => socket.send(raw),
    nextSeq: () => {
      seq += 1;
      return seq;
    },
    setMaxBytes: (bytes) => {
      maxBytes = bytes;
    },
    close: () => {
      socket.close();
    },
  };
};

export { openLobbyLink };
