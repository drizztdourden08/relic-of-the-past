/* @layer bridge-wasm @kind logic */
import { isLoopbackServer } from './is-loopback-server';
import { LOOPBACK_HOST, PORT_DIGITS } from './room-urls-of.constants';
import type { RoomUrls } from './room-urls.type';

const movedRoomUrlsOf = (lobbyServer: string, address: string, wasLocal: boolean): RoomUrls => {
  const port = address.slice(address.lastIndexOf(':') + 1);
  if (!wasLocal || !isLoopbackServer(lobbyServer) || !PORT_DIGITS.test(port)) return { serverUrl: address };
  return { serverUrl: `${LOOPBACK_HOST}:${port}`, fallbackServerUrl: address };
};

export { movedRoomUrlsOf };
