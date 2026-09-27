/* @layer bridge-wasm @kind logic */
/**
 * Pre-flight probe for an online randomizer boot. Opens a WebSocket to the
 * server, reads the RoomInfo it greets every socket with, then closes. It never
 * sends Connect, so the room sees no join and no leave: the probe answers only
 * whether the server is reachable and hosts this game, and reads its version.
 * A wrong slot name or password is the real session's to report, through its
 * own error path. A bare local host:port tries ws:// only; any other tries
 * wss:// first and ws:// when the secure socket never opens (server-url.ts).
 */
import { AP_GAME } from '@shared/randomizer/archipelago/ap-game';
import { parseServerPackets, versionOf } from './online-handshake';
import { createBrowserSocket } from './browser-socket';
import { normalizeServerUrl, serverUrlCandidates } from './server-url';
import type { ApRoomInfoPacket, ApServerPacket } from './ap-protocol.type';
import type { ApSocket, CreateSocket } from './ap-socket.type';

const PROBE_TIMEOUT_MS = 8000;

type ProbeResult = { ok: true; url?: string; version?: string } | { ok: false; reason: string };

interface ProbeConfig {
  url: string;
  /** Server-side game key; defaults to this app's own registered name. */
  game?: string;
  createSocket?: CreateSocket;
}

/** One attempt. `opened` tells the caller whether another scheme is worth a try. */
type AttemptResult = { result: ProbeResult; opened: boolean };

const roomInfoResult = (packet: ApRoomInfoPacket, url: string, game: string): ProbeResult => {
  const { major, minor, build } = versionOf(packet);
  const version = `${major}.${minor}.${build}`;
  if (!packet.games.includes(game)) return { ok: false, reason: `the room (server ${version}) has no ${game} slot` };
  return { ok: true, url, version };
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
      try { socket.close(); } catch { /* already closed */ }
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

const probeOnlineServer = async (config: ProbeConfig): Promise<ProbeResult> => {
  const candidates = serverUrlCandidates(config.url);
  if (candidates.length === 0) return { ok: false, reason: 'no server URL' };
  let last: ProbeResult = { ok: false, reason: 'no server URL' };
  for (const url of candidates) {
    const { result, opened } = await probeOnce(url, config);
    if (result.ok || opened) return result;
    last = result;
  }
  return last;
};

export { normalizeServerUrl, probeOnlineServer, PROBE_TIMEOUT_MS };
export type { ProbeConfig, ProbeResult };
