/* @layer tests @kind helper */
/**
 * The fake server's answers beyond the game connection (ap-fake-server.ts): a Tracker-tagged
 * Connect gets the named slot's own Connected, as the real server gives a tracker; a Get of
 * `_read_client_status_<team>_<slot>` gets the slot's status; `!players` through Say gets the
 * room's echo of the chat line, then the CommandResult line.
 */
import type {
  ApClientPacket, ApConnectPacket, ApNetworkPlayer, ApServerPacket,
} from '@app/lib/game/randomizer-client/ap-protocol.type';

interface FakeTrackedSlot {
  checked: number[];
  missing: number[];
}

interface FakeStorageRoom {
  clientStatus?: Record<number, number>;
  playersReply?: string;
  /** Every key a SetNotify asked to watch. */
  notified?: Set<string>;
}

const STATUS_KEY = /^_read_client_status_\d+_(\d+)$/;

const answerTracker = (
  tracked: Record<string, FakeTrackedSlot>, players: readonly ApNetworkPlayer[], packet: ApConnectPacket,
): ApServerPacket => {
  const player = players.find((entry) => entry.name === packet.name);
  const slot = tracked[packet.name];
  if (player === undefined || slot === undefined || packet.game !== '') {
    return { cmd: 'ConnectionRefused', errors: [player === undefined ? 'InvalidSlot' : 'InvalidGame'] };
  }
  return {
    cmd: 'Connected', team: player.team, slot: player.slot, players: [...players],
    checked_locations: [...slot.checked], missing_locations: [...slot.missing], slot_data: null,
  };
};

const answerStorage = (room: FakeStorageRoom, packet: ApClientPacket): ApServerPacket[] => {
  if (packet.cmd === 'Get') {
    const keys = Object.fromEntries(packet.keys.map((key) => {
      const match = STATUS_KEY.exec(key);
      // A room without statuses answers null, as a key the server does not fill.
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

export { answerStorage, answerTracker };
export type { FakeStorageRoom, FakeTrackedSlot };
