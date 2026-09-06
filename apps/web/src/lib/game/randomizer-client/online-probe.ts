/* @layer bridge-wasm @kind logic */
/**
 * Pre-flight probe for an online randomizer boot. Opens a WebSocket to the
 * server and walks the full handshake (RoomInfo, GetDataPackage, Connect,
 * Connected) with the same packet builders the real session uses, then closes.
 * No session, no scouts, no polling: the only question answered is whether a
 * real connection would succeed right now.
 */
import { buildConnect, buildGetDataPackage, parseServerPackets } from './online-handshake';
import type { ApServerPacket } from './ap-protocol.type';

const PROBE_TIMEOUT_MS = 8000;
const DEFAULT_GAME = 'Relic of the Past';

type ProbeResult = { ok: true } | { ok: false; reason: string };

interface ProbeConfig {
  url: string;
  slotName: string;
  /** Server-side game key; defaults to this app's own registered name. */
  game?: string;
}

/** A bare host:port from the creation form becomes a ws:// URL. */
const normalizeServerUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed || /^wss?:\/\//i.test(trimmed)) return trimmed;
  return `ws://${trimmed}`;
};

const probeOnlineServer = (config: ProbeConfig): Promise<ProbeResult> =>
  new Promise((resolve) => {
    const { url, slotName, game = DEFAULT_GAME } = config;
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let socket: WebSocket;

    const finish = (result: ProbeResult): void => {
      if (settled) return;
      settled = true;
      if (timer != null) clearTimeout(timer);
      try { socket.close(); } catch { /* already closed */ }
      resolve(result);
    };

    try {
      socket = new WebSocket(url);
    } catch (error) {
      resolve({ ok: false, reason: `invalid server URL: ${error instanceof Error ? error.message : String(error)}` });
      return;
    }
    timer = setTimeout(() => finish({ ok: false, reason: `no handshake within ${PROBE_TIMEOUT_MS / 1000}s` }), PROBE_TIMEOUT_MS);

    const handlePacket = (packet: ApServerPacket): void => {
      switch (packet.cmd) {
        case 'RoomInfo':
          socket.send(JSON.stringify([buildGetDataPackage(game)]));
          break;
        case 'DataPackage':
          if (!packet.data.games[game]) {
            finish({ ok: false, reason: `server data package has no entry for ${game}` });
            return;
          }
          socket.send(JSON.stringify([buildConnect(game, slotName)]));
          break;
        case 'Connected':
          finish({ ok: true });
          break;
        case 'ConnectionRefused':
          finish({ ok: false, reason: `connection refused: ${packet.errors.join(', ')}` });
          break;
        default:
          break; // Unrelated server chatter is ignored, and the handshake decides.
      }
    };

    socket.onmessage = (event) => {
      for (const packet of parseServerPackets(String(event.data))) handlePacket(packet);
    };
    socket.onerror = () => finish({ ok: false, reason: 'socket error before the handshake completed' });
    socket.onclose = () => finish({ ok: false, reason: 'connection closed before the handshake completed' });
  });

export { normalizeServerUrl, probeOnlineServer, PROBE_TIMEOUT_MS };
export type { ProbeConfig, ProbeResult };
