/* @layer bridge-wasm @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { ApSocket } from '@rotp/randomizer';
import type { LobbySocketEvent } from '@app/ipc';

const sockets = new Map<string, ApSocket>();
let subscribed = false;

const dispatch = (event: LobbySocketEvent): void => {
  const socket = sockets.get(event.id);
  if (socket === undefined) return;
  if (event.kind === 'open') socket.onopen?.(event);
  else if (event.kind === 'message') socket.onmessage?.({ data: event.text });
  else if (event.kind === 'error') socket.onerror?.(event);
  else {
    sockets.delete(event.id);
    socket.onclose?.(event);
  }
};

const registerLobbySocket = (id: string, socket: ApSocket): void => {
  if (!subscribed) {
    subscribed = true;
    requireHostApi().onLobbySocketEvent(dispatch);
  }
  sockets.set(id, socket);
};

export { registerLobbySocket };
