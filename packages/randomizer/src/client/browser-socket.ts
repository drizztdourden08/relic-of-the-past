/* @layer bridge-wasm @kind logic */
import type { ApSocket, CreateSocket } from './ap-socket.type';

const createBrowserSocket: CreateSocket = (url) => {
  const ws = new WebSocket(url);
  const socket: ApSocket = {
    send: (data) => { ws.send(data); },
    close: () => { ws.close(); },
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  };
  ws.onopen = (event) => { socket.onopen?.(event); };
  ws.onmessage = (event) => { socket.onmessage?.(event); };
  ws.onerror = (event) => { socket.onerror?.(event); };
  ws.onclose = (event) => { socket.onclose?.(event); };
  return socket;
};

export { createBrowserSocket };
