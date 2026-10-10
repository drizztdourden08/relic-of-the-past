/* @layer tests @kind helper */
import type { ApSocket, CreateSocket, ApClientPacket } from '@rotp/randomizer';
import { VERSION } from './ap-fake-server.constants';
import type { FakeRoom, FakeServer } from './ap-fake-server.type';
import type { FakeServerWires } from './fake-server-wires.type';
import { answerClient, pushTo } from './answer-client';

const close = (wires: FakeServerWires, socket: ApSocket): void => {
  wires.open.delete(socket);
  wires.trackerNames.delete(socket);
  if (wires.live === socket) wires.live = null;
  queueMicrotask(() => socket.onclose?.({}));
};

const openSocket = (wires: FakeServerWires, socket: ApSocket, url: string): void => {
  const { room } = wires;
  if (room.refusedUrls.has(url)) {
    socket.onerror?.({});
    socket.onclose?.({});
    return;
  }
  wires.open.add(socket);
  const firstSocketIsTheGames = wires.live === null;
  if (firstSocketIsTheGames) wires.live = socket;
  socket.onopen?.({});
  const checksums = Object.fromEntries(Object.entries(room.games).map(([game, data]) => [game, data.checksum ?? '']));
  pushTo(wires, socket, [{
    cmd: 'RoomInfo', games: Object.keys(room.games), version: VERSION, password: room.password !== undefined,
    datapackage_checksums: checksums, ...(room.seedName !== undefined ? { seed_name: room.seedName } : {}),
  }]);
};

const socketFactory = (wires: FakeServerWires): CreateSocket => (url) => {
  wires.urls.push(url);
  const socket: ApSocket = {
    onopen: null, onmessage: null, onerror: null, onclose: null,
    send: (data) => {
      for (const packet of JSON.parse(data) as ApClientPacket[]) {
        wires.received.push(packet);
        answerClient(wires, socket, packet);
      }
    },
    close: () => close(wires, socket),
  };
  queueMicrotask(() => openSocket(wires, socket, url));
  return socket;
};

const createFakeServer = (room: FakeRoom): FakeServer => {
  const wires: FakeServerWires = { room, urls: [], received: [], open: new Set(), trackerNames: new Map(), live: null };
  return {
    createSocket: socketFactory(wires),
    urls: wires.urls,
    received: wires.received,
    push: (packets) => { if (wires.live) pushTo(wires, wires.live, packets); },
    pushTracker: (name, packets) => {
      for (const [socket, tracked] of wires.trackerNames) if (tracked === name) pushTo(wires, socket, packets);
    },
    trackers: () => [...wires.trackerNames.values()],
    drop: () => {
      const socket = wires.live;
      if (socket) close(wires, socket);
    },
    of: (cmd) => wires.received.filter((packet) => packet.cmd === cmd) as never,
  };
};

export { createFakeServer };
