/* @layer bridge-wasm @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { createBrowserSocket } from '@rotp/randomizer';
import type { ApSocket, CreateSocket } from '@rotp/randomizer';
import { registerLobbySocket } from './lobby-socket-hub';

let counter = 0;

const quietly = (pending: Promise<void>): void => {
  pending.catch(() => undefined);
};

const createMainSocket: CreateSocket = (url) => {
  const api = requireHostApi();
  if (typeof api.openLobbySocket !== 'function') return createBrowserSocket(url);
  counter += 1;
  const id = `lobby-${String(counter)}-${crypto.randomUUID()}`;
  const socket: ApSocket = {
    send: (data) => { quietly(api.sendLobbySocket(id, data)); },
    close: () => { quietly(api.closeLobbySocket(id)); },
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  };
  registerLobbySocket(id, socket);
  api.openLobbySocket(id, url).catch(() => {
    socket.onerror?.({ id });
    socket.onclose?.({ id });
  });
  return socket;
};

export { createMainSocket };
