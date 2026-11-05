/* @layer tests @kind helper */
import type { ApClientPacket, ArchipelagoSocket, CreateSocket } from '@drizztdourden08/brock-randomizer/archipelago';
import { VERSION } from './ap-fake-server.constants';
import type { FakeRoom, FakeServer } from './ap-fake-server.type';
import type { FakeServerWires } from './fake-server-wires.type';
import { answerClient, pushTo } from './answer-client';

const CLOSED_BY_CLIENT = 1000;
const CLOSED_ABNORMALLY = 1006;

const close = (wires: FakeServerWires, socket: ArchipelagoSocket, code: number): void => {
  wires.open.delete(socket);
  wires.trackerNames.delete(socket);
  if (wires.live === socket) wires.live = null;
  queueMicrotask(() => wires.handlers.get(socket)?.close(code));
};

const openSocket = (wires: FakeServerWires, socket: ArchipelagoSocket, url: string): void => {
  const { room } = wires;
  if (room.refusedUrls.has(url)) {
    wires.handlers.get(socket)?.close(CLOSED_ABNORMALLY);
    return;
  }
  wires.open.add(socket);
  const firstSocketIsTheGames = wires.live === null;
  if (firstSocketIsTheGames) wires.live = socket;
  wires.handlers.get(socket)?.open();
  const checksums = Object.fromEntries(Object.entries(room.games).map(([game, data]) => [game, data.checksum ?? '']));
  pushTo(wires, socket, [{
    cmd: 'RoomInfo', games: Object.keys(room.games), version: VERSION, password: room.password !== undefined,
    datapackage_checksums: checksums, ...(room.seedName !== undefined ? { seed_name: room.seedName } : {}),
  }]);
};

const socketFactory = (wires: FakeServerWires): CreateSocket => (url) => {
  wires.urls.push(url);
  const handlers = { open: (): void => undefined, message: (_text: string): void => undefined, close: (_code: number): void => undefined };
  const socket: ArchipelagoSocket = {
    send: (data) => {
      for (const packet of JSON.parse(data) as ApClientPacket[]) {
        wires.received.push(packet);
        answerClient(wires, socket, packet);
      }
    },
    close: () => close(wires, socket, CLOSED_BY_CLIENT),
    onOpen: (f) => { handlers.open = f; },
    onMessage: (f) => { handlers.message = f; },
    onClose: (f) => { handlers.close = f; },
  };
  wires.handlers.set(socket, handlers);
  queueMicrotask(() => openSocket(wires, socket, url));
  return socket;
};

const createFakeServer = (room: FakeRoom): FakeServer => {
  const wires: FakeServerWires = {
    room, urls: [], received: [], open: new Set(), handlers: new Map(), trackerNames: new Map(), live: null,
  };
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
      if (socket) close(wires, socket, CLOSED_ABNORMALLY);
    },
    of: (cmd) => wires.received.filter((packet) => packet.cmd === cmd) as never,
  };
};

export { createFakeServer };
