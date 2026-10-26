/* @layer bridge-wasm @kind logic */
import type { StartedRoom } from '@rotp/randomizer';
import { isLoopbackServer } from './is-loopback-server';
import type { RoomUrls } from './room-urls.type';
import { withScheme } from './with-scheme';

const roomUrlsOf = (lobbyServer: string, room: StartedRoom): RoomUrls => {
  const normal = withScheme(`${room.host}:${room.port}`, room.tls);
  if (room.localAddress === undefined || !isLoopbackServer(lobbyServer)) return { serverUrl: normal };
  return { serverUrl: withScheme(room.localAddress, room.tls), fallbackServerUrl: normal };
};

export { roomUrlsOf };
