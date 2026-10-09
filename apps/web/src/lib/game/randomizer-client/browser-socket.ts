/* @layer bridge-wasm @kind logic */
import type { ApSocket, CreateSocket } from './ap-socket.type';

const createBrowserSocket: CreateSocket = (url) => new WebSocket(url) as unknown as ApSocket;

export { createBrowserSocket };
