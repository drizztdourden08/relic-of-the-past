/* @layer tests @kind helper */
import type { ApClientPacket, ApServerPacket } from '@app/lib/game/randomizer-client/ap-protocol.type';
import { STATUS_KEY } from './ap-fake-server.constants';
import type { FakeStorageRoom } from './ap-fake-server.type';

const answerStorage = (room: FakeStorageRoom, packet: ApClientPacket): ApServerPacket[] => {
  if (packet.cmd === 'Get') {
    const keys = Object.fromEntries(packet.keys.map((key) => {
      const match = STATUS_KEY.exec(key);
      if (match === null || room.clientStatus === undefined) return [key, null];
      return [key, room.clientStatus[Number(match[1])] ?? 0];
    }));
    return [{ cmd: 'Retrieved', keys }];
  }
  if (packet.cmd === 'SetNotify') {
    room.notified ??= new Set();
    for (const key of packet.keys) room.notified.add(key);
    return [];
  }
  if (packet.cmd === 'Say' && packet.text === '!players') {
    const echo: ApServerPacket = {
      cmd: 'PrintJSON', type: 'Chat', team: 0, slot: 1, message: packet.text, data: [{ text: `Link: ${packet.text}` }],
    };
    if (room.playersReply === undefined) return [echo];
    return [echo, { cmd: 'PrintJSON', type: 'CommandResult', data: [{ text: room.playersReply }] }];
  }
  return [];
};

export { answerStorage };
