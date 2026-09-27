/* @layer tests @kind helper */
/**
 * An in-process multiworld server for the protocol test: every socket the client opens lands
 * here, and the server answers the way a real room does (RoomInfo on open, the data package,
 * Connected then the full ReceivedItems list, scout answers, Sync, data storage reads,
 * `!players`). A Connect with the Tracker tag makes a tracker socket, answered with the
 * named slot's locations (ap-fake-tracker.ts). Every message crosses on a microtask, like a
 * network hop. Nothing touches a disk or a profile.
 */
import { answerStorage, answerTracker } from './ap-fake-tracker';
import type { ApSocket, CreateSocket } from '@app/lib/game/randomizer-client/ap-socket.type';
import type {
  ApClientPacket, ApGameData, ApNetworkItem, ApNetworkPlayer, ApServerPacket,
} from '@app/lib/game/randomizer-client/ap-protocol.type';
import type { FakeTrackedSlot } from './ap-fake-tracker';

interface FakeRoom {
  password?: string;
  games: Record<string, ApGameData>;
  items: ApNetworkItem[];
  checked: number[];
  missing: number[];
  players: ApNetworkPlayer[];
  slotInfo: Record<string, { name: string; game: string; type: number; group_members: number[] }>;
  slotData: unknown;
  /** Scouted location id to the item placed there. */
  placements: Record<number, ApNetworkItem>;
  /** URLs whose socket never opens (a wss:// the server does not answer). */
  refusedUrls: Set<string>;
  /** The room's seed name, sent in RoomInfo; absent, RoomInfo names none. */
  seedName?: string;
  /** Each slot's client status (0 when absent), read through `_read_client_status_0_<slot>`. */
  clientStatus?: Record<number, number>;
  /** The CommandResult line `!players` gets; absent, the server never answers it. */
  playersReply?: string;
  /** The slots a tracker may connect to, by slot name. */
  tracked?: Record<string, FakeTrackedSlot>;
  /** Every key a SetNotify asked to watch, filled by the server. */
  notified?: Set<string>;
}

interface FakeServer {
  readonly createSocket: CreateSocket;
  readonly urls: string[];
  /** Every client packet, all sockets, in order. */
  readonly received: ApClientPacket[];
  /** To the main (game) socket. */
  push(packets: ApServerPacket[]): void;
  /** To the open tracker sockets of the slot named. */
  pushTracker(name: string, packets: ApServerPacket[]): void;
  /** The slot names of the open tracker sockets. */
  trackers(): string[];
  /** The server drops the live socket. */
  drop(): void;
  of<C extends ApClientPacket['cmd']>(cmd: C): Extract<ApClientPacket, { cmd: C }>[];
}

const VERSION = { major: 0, minor: 6, build: 3, class: 'Version' as const };

const createFakeServer = (room: FakeRoom): FakeServer => {
  const urls: string[] = [];
  const received: ApClientPacket[] = [];
  const open = new Set<ApSocket>();
  const trackerNames = new Map<ApSocket, string>();
  let live: ApSocket | null = null;

  const pushTo = (socket: ApSocket, packets: ApServerPacket[]): void => {
    queueMicrotask(() => {
      if (open.has(socket)) socket.onmessage?.({ data: JSON.stringify(packets) });
    });
  };

  const fullItems = (): ApServerPacket => ({ cmd: 'ReceivedItems', index: 0, items: [...room.items] });

  const answerConnect = (socket: ApSocket, packet: Extract<ApClientPacket, { cmd: 'Connect' }>): void => {
    if ((room.password ?? null) !== packet.password) {
      pushTo(socket, [{ cmd: 'ConnectionRefused', errors: ['InvalidPassword'] }]);
    } else if (packet.tags.includes('Tracker')) {
      if (live === socket) live = null;
      const reply = answerTracker(room.tracked ?? {}, room.players, packet);
      if (reply.cmd === 'Connected') trackerNames.set(socket, packet.name);
      pushTo(socket, [reply]);
    } else {
      pushTo(socket, [{
        cmd: 'Connected', team: 0, slot: 1, players: room.players, checked_locations: [...room.checked],
        missing_locations: [...room.missing], slot_data: room.slotData, slot_info: room.slotInfo,
      }, fullItems()]);
    }
  };

  const answer = (socket: ApSocket, packet: ApClientPacket): void => {
    if (packet.cmd === 'GetDataPackage') {
      const games = Object.fromEntries(packet.games.map((game) => [game, room.games[game]]));
      pushTo(socket, [{ cmd: 'DataPackage', data: { games } }]);
    } else if (packet.cmd === 'Connect') {
      answerConnect(socket, packet);
    } else if (packet.cmd === 'LocationScouts') {
      const locations = packet.locations.map((id) => room.placements[id]).filter(Boolean);
      pushTo(socket, [{ cmd: 'LocationInfo', locations }]);
    } else if (packet.cmd === 'Sync') {
      pushTo(socket, [fullItems()]);
    } else if (packet.cmd === 'LocationChecks') {
      room.checked.push(...packet.locations);
    } else {
      const reply = answerStorage(room, packet);
      if (reply.length > 0) pushTo(socket, reply);
    }
  };

  const close = (socket: ApSocket): void => {
    open.delete(socket);
    trackerNames.delete(socket);
    if (live === socket) live = null;
    queueMicrotask(() => socket.onclose?.({}));
  };

  const createSocket: CreateSocket = (url) => {
    urls.push(url);
    const socket: ApSocket = {
      onopen: null, onmessage: null, onerror: null, onclose: null,
      send: (data) => {
        for (const packet of JSON.parse(data) as ApClientPacket[]) {
          received.push(packet);
          answer(socket, packet);
        }
      },
      close: () => close(socket),
    };
    queueMicrotask(() => {
      if (room.refusedUrls.has(url)) {
        socket.onerror?.({});
        socket.onclose?.({});
        return;
      }
      open.add(socket);
      // A second socket while the game's is up is a tracker's, until its Connect says.
      if (live === null) live = socket;
      socket.onopen?.({});
      const checksums = Object.fromEntries(Object.entries(room.games).map(([game, data]) => [game, data.checksum ?? '']));
      pushTo(socket, [{
        cmd: 'RoomInfo', games: Object.keys(room.games), version: VERSION, password: room.password !== undefined,
        datapackage_checksums: checksums, ...(room.seedName !== undefined ? { seed_name: room.seedName } : {}),
      }]);
    });
    return socket;
  };

  return {
    createSocket,
    urls,
    received,
    push: (packets) => { if (live) pushTo(live, packets); },
    pushTracker: (name, packets) => {
      for (const [socket, tracked] of trackerNames) if (tracked === name) pushTo(socket, packets);
    },
    trackers: () => [...trackerNames.values()],
    drop: () => {
      const socket = live;
      if (socket) close(socket);
    },
    of: (cmd) => received.filter((packet) => packet.cmd === cmd) as never,
  };
};

export { createFakeServer, VERSION };
export type { FakeRoom, FakeServer };
