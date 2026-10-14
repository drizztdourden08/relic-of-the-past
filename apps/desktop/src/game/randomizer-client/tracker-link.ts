/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { parseServerPackets, versionOf, openSocketLink, createReconnector, NO_ITEMS_HANDLING, TRACKER_TAGS } from '@rotp/randomizer';
import { blankToNull } from './blank-to-null';
import { wireList } from './wire-list';
import type { ApConnectPacket, ApServerPacket, SocketLink, TrackerLink, TrackerLinkConfig } from '@rotp/randomizer';

const createTrackerLink = (config: TrackerLinkConfig): TrackerLink => {
  const { url, slot, name, password, uuid, createSocket, onChange } = config;
  const checked = new Set<number>();
  let total: number | null = null;
  let linked = false;
  let ended = false;
  let link: SocketLink | null = null;

  const connectPacket = (packet: Extract<ApServerPacket, { cmd: 'RoomInfo' }>): ApConnectPacket => ({
    cmd: 'Connect', game: '', name, password: blankToNull(password), uuid, version: versionOf(packet),
    items_handling: NO_ITEMS_HANDLING, tags: [...TRACKER_TAGS], slot_data: false,
  });

  const handle = (packet: ApServerPacket): void => {
    if (packet.cmd === 'RoomInfo') {
      link?.send(JSON.stringify([connectPacket(packet)]));
    } else if (packet.cmd === 'Connected') {
      checked.clear();
      for (const id of wireList(packet.checked_locations)) checked.add(id);
      total = checked.size + wireList(packet.missing_locations).length;
      linked = true;
      reconnector.reset();
      log.randomizer(`[Online] Tracking ${name} (slot ${slot}): ${checked.size} / ${total} checks`);
    } else if (packet.cmd === 'RoomUpdate') {
      for (const id of wireList(packet.checked_locations)) checked.add(id);
    } else if (packet.cmd === 'ConnectionRefused') {
      ended = true;
      log.randomizer(`[Online] Tracking ${name} refused: ${wireList(packet.errors).join(', ')}`, 'warn');
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

export { createTrackerLink };
export type { TrackerLink, TrackerLinkConfig, TrackerProgress } from '@rotp/randomizer';
