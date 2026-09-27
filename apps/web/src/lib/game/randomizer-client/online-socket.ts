/* @layer bridge-wasm @kind logic */
/**
 * One connection to the room, over the candidate URLs of server-url.ts in order: a socket
 * that closes without ever opening hands over to the next candidate (wss:// failing on a
 * local server falls back to ws://). The session hears one close, for the last socket.
 */
import type { ApSocket, CreateSocket } from './ap-socket.type';

interface SocketLinkHandlers {
  onOpen(url: string): void;
  onMessage(data: string): void;
  /** `opened`: whether any candidate ever opened (a drop, versus nothing answering). */
  onClose(opened: boolean): void;
}

interface SocketLink {
  send(data: string): void;
  /** False when no socket is left to close, so the caller cleans up itself. */
  close(): boolean;
}

const openSocketLink = (
  candidates: readonly string[], createSocket: CreateSocket, handlers: SocketLinkHandlers,
): SocketLink => {
  let current: ApSocket | null = null;
  let closing = false;

  const tryAt = (index: number): void => {
    const url = candidates[index];
    const hasNext = index + 1 < candidates.length;
    let socket: ApSocket;
    try {
      socket = createSocket(url);
    } catch {
      // Deferred, so the caller holds the link before it hears the close.
      if (hasNext && !closing) tryAt(index + 1);
      else queueMicrotask(() => handlers.onClose(false));
      return;
    }
    let opened = false;
    current = socket;
    socket.onopen = () => {
      opened = true;
      handlers.onOpen(url);
    };
    socket.onmessage = (event) => handlers.onMessage(String(event.data));
    socket.onerror = () => undefined; // The close that follows decides.
    socket.onclose = () => {
      if (current !== socket) return;
      current = null;
      if (!opened && hasNext && !closing) tryAt(index + 1);
      else handlers.onClose(opened);
    };
  };

  if (candidates.length === 0) queueMicrotask(() => handlers.onClose(false));
  else tryAt(0);

  return {
    send(data) {
      try {
        current?.send(data);
      } catch { /* not open yet or already closing: the reconnect resends what matters */ }
    },
    close() {
      closing = true;
      if (current === null) return false;
      current.close();
      return true;
    },
  };
};

export { openSocketLink };
export type { SocketLink, SocketLinkHandlers };
