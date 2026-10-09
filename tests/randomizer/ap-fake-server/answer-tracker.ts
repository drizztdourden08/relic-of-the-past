/* @layer tests @kind helper */
import type {
  ApConnectPacket, ApNetworkPlayer, ApServerPacket,
} from '@app/lib/game/randomizer-client/ap-protocol.type';
import type { FakeTrackedSlot } from './ap-fake-server.type';

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

export { answerTracker };
