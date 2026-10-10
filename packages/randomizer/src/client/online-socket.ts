/* @layer bridge-wasm @kind logic */
import { itemAt } from '../checked-access';
import type { ApSocket, CreateSocket } from './ap-socket.type';
import type { SocketLink, SocketLinkHandlers } from './online-socket.type';

const openSocketLink = (
  candidates: readonly string[], createSocket: CreateSocket, handlers: SocketLinkHandlers,
): SocketLink => {
  let current: ApSocket | null = null;
  let closing = false;

  const tryAt = (index: number): void => {
    const url = itemAt(candidates, index);
    const hasNext = index + 1 < candidates.length;
    let socket: ApSocket;
    try {
      socket = createSocket(url);
    } catch {
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
    socket.onerror = () => undefined;
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
      } catch {
        return undefined;
      }
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
export type { SocketLink, SocketLinkHandlers } from './online-socket.type';
