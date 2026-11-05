/* @layer renderer-app @kind logic */
import { buildConnectPacket, clientUuid, createBrowserSocket, parseServerPackets, versionOf } from '@drizztdourden08/brock-randomizer/archipelago';
import type { ApConnectedPacket, ApRoomInfoPacket, ApServerPacket, ArchipelagoSocket } from '@drizztdourden08/brock-randomizer/archipelago';
import { AP_GAME, parseSlotData } from '@rotp/randomizer';
import { SLOT_PROBE_MS } from './launch-connect.constants';
import type { ProbeAttempt, ProbeTarget, SlotProbe } from './slot-probe.type';

const slotDataResult = (packet: ApConnectedPacket): SlotProbe => {
  const parsed = parseSlotData(packet.slot_data);
  if (parsed.kind === 'ok') return { ok: true, slotData: parsed.slotData };
  if (parsed.kind === 'version') return { ok: false, error: parsed.message };
  return { ok: false, error: 'the slot data is missing or not this world\'s shape' };
};

const connectLine = (room: ApRoomInfoPacket, { slot, password }: ProbeTarget): string =>
  JSON.stringify([buildConnectPacket({ game: AP_GAME, slotName: slot, uuid: clientUuid(), password: password ?? undefined, version: versionOf(room) })]);

const probeSlotAttempt = (target: ProbeTarget): Promise<ProbeAttempt> =>
  new Promise((resolve) => {
    let settled = false;
    let opened = false;
    let socket: ArchipelagoSocket | null = null;
    const finish = (result: SlotProbe): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket?.close();
      resolve({ result, opened });
    };
    const timer = setTimeout(() => finish({ ok: false, error: `no answer from ${target.url} within ${SLOT_PROBE_MS / 1000}s` }), SLOT_PROBE_MS);

    const handle = (packet: ApServerPacket): void => {
      opened = true;
      if (packet.cmd === 'RoomInfo') socket?.send(connectLine(packet, target));
      else if (packet.cmd === 'Connected') finish(slotDataResult(packet));
      else if (packet.cmd === 'ConnectionRefused') finish({ ok: false, error: `the server refused slot "${target.slot}": ${packet.errors.join(', ')}` });
    };

    try {
      socket = createBrowserSocket(target.url);
    } catch (error) {
      finish({ ok: false, error: `invalid server URL: ${error instanceof Error ? error.message : String(error)}` });
      return;
    }
    socket.onMessage((text) => { for (const packet of parseServerPackets(text)) handle(packet); });
    socket.onClose(() => finish({ ok: false, error: opened ? `${target.url} closed before answering` : `could not reach ${target.url}` }));
  });

export { probeSlotAttempt };
