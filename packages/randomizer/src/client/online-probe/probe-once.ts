/* @layer bridge-wasm @kind logic */
import { AP_GAME } from '../../archipelago/ap-game';
import { parseServerPackets, versionOf } from '../online-handshake';
import { createBrowserSocket } from '../browser-socket';
import { PROBE_TIMEOUT_MS } from './online-probe.constants';
import type { ApRoomInfoPacket, ApServerPacket } from '../ap-protocol.type';
import type { ApSocket } from '../ap-socket.type';
import type { AttemptResult, ProbeConfig, ProbeResult } from './online-probe.type';

const roomInfoResult = (packet: ApRoomInfoPacket, url: string, game: string): ProbeResult => {
  const { major, minor, build } = versionOf(packet);
  const version = `${major}.${minor}.${build}`;
  if (!packet.games.includes(game)) return { ok: false, reason: `the room (server ${version}) has no ${game} slot` };
  return { ok: true, url, version };
};

const closeQuietly = (socket: ApSocket): void => {
  try { socket.close(); } catch { return; }
};

const probeOnce = (url: string, config: ProbeConfig): Promise<AttemptResult> =>
  new Promise((resolve) => {
    const { game = AP_GAME, createSocket = createBrowserSocket } = config;
    let settled = false;
    let opened = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let socket: ApSocket;

    const finish = (result: ProbeResult): void => {
      if (settled) return;
      settled = true;
      if (timer != null) clearTimeout(timer);
      closeQuietly(socket);
      resolve({ result, opened });
    };

    try {
      socket = createSocket(url);
    } catch (error) {
      resolve({ result: { ok: false, reason: `invalid server URL: ${error instanceof Error ? error.message : String(error)}` }, opened });
      return;
    }
    timer = setTimeout(() => finish({ ok: false, reason: `no room info within ${PROBE_TIMEOUT_MS / 1000}s` }), PROBE_TIMEOUT_MS);

    const handlePacket = (packet: ApServerPacket): void => {
      opened = true;
      if (packet.cmd === 'RoomInfo') finish(roomInfoResult(packet, url, game));
    };

    socket.onopen = () => { opened = true; };
    socket.onmessage = (event) => {
      for (const packet of parseServerPackets(String(event.data))) handlePacket(packet);
    };
    socket.onerror = () => finish({ ok: false, reason: 'socket error before the room info arrived' });
    socket.onclose = () => finish({ ok: false, reason: 'connection closed before the room info arrived' });
  });

export { probeOnce };
