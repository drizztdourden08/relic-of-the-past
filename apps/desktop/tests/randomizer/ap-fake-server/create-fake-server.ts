/* @layer tests @kind helper */
import type { ApSocket, CreateSocket, ApClientPacket, ApServerPacket } from '@rotp/randomizer';
import { VERSION } from './ap-fake-server.constants';
import type { FakeRoom, FakeServer } from './ap-fake-server.type';
import { answerStorage } from './answer-storage';
import { answerTracker } from './answer-tracker';

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
      const firstSocketIsTheGames = live === null;
      if (firstSocketIsTheGames) live = socket;
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

export { createFakeServer };
