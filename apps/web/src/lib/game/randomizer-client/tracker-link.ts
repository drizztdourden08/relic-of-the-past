/* @layer bridge-wasm @kind logic */
/**
 * A read-only connection to another player's slot, the way a tracker makes one: Connect
 * under that slot's name with the Tracker tag and no game, which the server accepts without
 * the slot's game, sends no items to and takes no checks from. NoText spares it the room's
 * chat. Its Connected holds the slot's checked and missing locations, and every RoomUpdate
 * after it the newly checked ones: that is the only way the server shares another slot's
 * progress. A drop redials on the backoff of reconnect.ts; a refusal ends the link.
 */
import { log } from '../../log-bus';
import { parseServerPackets, versionOf } from './online-handshake';
import { openSocketLink } from './online-socket';
import { createReconnector } from './reconnect';
import type { ApConnectPacket, ApServerPacket } from './ap-protocol.type';
import type { CreateSocket } from './ap-socket.type';
import type { SocketLink } from './online-socket';

const TRACKER_TAGS: readonly string[] = ['Tracker', 'NoText'];

interface TrackerLinkConfig {
  url: string;
  slot: number;
  name: string;
  password?: string;
  /** This install's client id plus `-tracker-<slot>`. */
  uuid: string;
  createSocket: CreateSocket;
  /** The link's progress or state moved. */
  onChange(): void;
}

interface TrackerProgress {
  checked: number;
  total: number;
}

interface TrackerLink {
  /** Null until the slot was accepted once. */
  readonly progress: TrackerProgress | null;
  /** The slot is accepted on the live socket. */
  readonly linked: boolean;
  close(): void;
}

const createTrackerLink = (config: TrackerLinkConfig): TrackerLink => {
  const { url, slot, name, password, uuid, createSocket, onChange } = config;
  const checked = new Set<number>();
  let total: number | null = null;
  let linked = false;
  let ended = false;
  let link: SocketLink | null = null;

  const connectPacket = (packet: Extract<ApServerPacket, { cmd: 'RoomInfo' }>): ApConnectPacket => ({
    cmd: 'Connect', game: '', name, password: password ? password : null, uuid, version: versionOf(packet),
    items_handling: 0, tags: [...TRACKER_TAGS], slot_data: false,
  });

  const handle = (packet: ApServerPacket): void => {
    if (packet.cmd === 'RoomInfo') {
      link?.send(JSON.stringify([connectPacket(packet)]));
    } else if (packet.cmd === 'Connected') {
      checked.clear();
      for (const id of packet.checked_locations ?? []) checked.add(id);
      total = checked.size + (packet.missing_locations ?? []).length;
      linked = true;
      reconnector.reset();
      log.randomizer(`[Online] Tracking ${name} (slot ${slot}): ${checked.size} / ${total} checks`);
    } else if (packet.cmd === 'RoomUpdate') {
      for (const id of packet.checked_locations ?? []) checked.add(id);
    } else if (packet.cmd === 'ConnectionRefused') {
      ended = true;
      log.randomizer(`[Online] Tracking ${name} refused: ${(packet.errors ?? []).join(', ')}`, 'warn');
      link?.close();
    }
  };

  const connect = (): void => {
    link = openSocketLink([url], createSocket, {
      onOpen: () => undefined,
      onMessage: (data) => {
        for (const packet of parseServerPackets(data)) handle(packet);
        onChange();
      },
      onClose: () => {
        link = null;
        linked = false;
        if (!ended) reconnector.schedule();
        onChange();
      },
    });
  };

  const reconnector = createReconnector(connect);
  connect();

  return {
    get progress() { return total === null ? null : { checked: checked.size, total }; },
    get linked() { return linked; },
    close() {
      ended = true;
      reconnector.cancel();
      linked = false;
      link?.close();
    },
  };
};

export { createTrackerLink, TRACKER_TAGS };
export type { TrackerLink, TrackerLinkConfig, TrackerProgress };
