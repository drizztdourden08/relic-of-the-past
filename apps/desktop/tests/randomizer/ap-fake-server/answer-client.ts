/* @layer tests @kind helper */
import type { ApClientPacket, ApGameData, ApNetworkItem, ApServerPacket, ApSocket } from '@rotp/randomizer';
import type { FakeServerWires } from './fake-server-wires.type';
import { answerStorage } from './answer-storage';
import { answerTracker } from './answer-tracker';

const pushTo = (wires: FakeServerWires, socket: ApSocket, packets: ApServerPacket[]): void => {
  queueMicrotask(() => {
    if (wires.open.has(socket)) socket.onmessage?.({ data: JSON.stringify(packets) });
  });
};

const fullItems = (wires: FakeServerWires): ApServerPacket => ({ cmd: 'ReceivedItems', index: 0, items: [...wires.room.items] });

const answerConnect = (
  wires: FakeServerWires, socket: ApSocket, packet: Extract<ApClientPacket, { cmd: 'Connect' }>,
): void => {
  const { room } = wires;
  if ((room.password ?? null) !== packet.password) {
    pushTo(wires, socket, [{ cmd: 'ConnectionRefused', errors: ['InvalidPassword'] }]);
  } else if (packet.tags.includes('Tracker')) {
    if (wires.live === socket) wires.live = null;
    const reply = answerTracker(room.tracked ?? {}, room.players, packet);
    if (reply.cmd === 'Connected') wires.trackerNames.set(socket, packet.name);
    pushTo(wires, socket, [reply]);
  } else {
    pushTo(wires, socket, [{
      cmd: 'Connected', team: 0, slot: 1, players: room.players, checked_locations: [...room.checked],
      missing_locations: [...room.missing], slot_data: room.slotData, slot_info: room.slotInfo,
    }, fullItems(wires)]);
  }
};

const knownGames = (wires: FakeServerWires, names: readonly string[]): Record<string, ApGameData> => {
  const games: Record<string, ApGameData> = {};
  for (const game of names) {
    const data = wires.room.games[game];
    if (data !== undefined) games[game] = data;
  }
  return games;
};

const placedItems = (wires: FakeServerWires, ids: readonly number[]): ApNetworkItem[] =>
  ids.map((id) => wires.room.placements[id]).filter((item): item is ApNetworkItem => item !== undefined);

const answerClient = (wires: FakeServerWires, socket: ApSocket, packet: ApClientPacket): void => {
  if (packet.cmd === 'GetDataPackage') {
    pushTo(wires, socket, [{ cmd: 'DataPackage', data: { games: knownGames(wires, packet.games) } }]);
  } else if (packet.cmd === 'Connect') {
    answerConnect(wires, socket, packet);
  } else if (packet.cmd === 'LocationScouts') {
    pushTo(wires, socket, [{ cmd: 'LocationInfo', locations: placedItems(wires, packet.locations) }]);
  } else if (packet.cmd === 'Sync') {
    pushTo(wires, socket, [fullItems(wires)]);
  } else if (packet.cmd === 'LocationChecks') {
    wires.room.checked.push(...packet.locations);
  } else {
    const reply = answerStorage(wires.room, packet);
    if (reply.length > 0) pushTo(wires, socket, reply);
  }
};

export { answerClient, pushTo };
