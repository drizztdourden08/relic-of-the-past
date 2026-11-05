/* @layer tests @kind helper */
import type { ApPrintJsonPacket, ApServerPacket } from '@rotp/randomizer';
import { traceItem } from './trace-room';

type ApJsonMessagePart = ApPrintJsonPacket['data'][number];

const text = (value: string): ApJsonMessagePart => ({ type: 'text', text: value });
const playerPart = (slot: number): ApJsonMessagePart => ({ type: 'player_id', text: String(slot) });
const itemPart = (id: number, owner: number): ApJsonMessagePart => ({ type: 'item_id', text: String(id), player: owner, flags: 0 });
const locationPart = (id: number, owner: number): ApJsonMessagePart => ({ type: 'location_id', text: String(id), player: owner });

const itemSend = (type: string, receiving: number, finder: number, id: number, location: number, team = 0): ApPrintJsonPacket => ({
  cmd: 'PrintJSON',
  type,
  team,
  receiving,
  item: traceItem(id, finder, location),
  data: [playerPart(finder), text(' sent '), itemPart(id, receiving), text(' to '), playerPart(receiving), text(' ('), locationPart(location, finder), text(')')],
});

const slotPrint = (type: string, slot: number, parts: ApJsonMessagePart[], message?: string): ApPrintJsonPacket => ({
  cmd: 'PrintJSON', type, team: 0, slot, data: parts, ...(message === undefined ? {} : { message }),
});

const PRINT_PACKETS: ReadonlyArray<{ label: string; packet: ApServerPacket }> = [
  { label: 'ItemSend received', packet: itemSend('ItemSend', 1, 2, 101, 900) },
  { label: 'ItemSend sent', packet: itemSend('ItemSend', 2, 1, 500, 2) },
  { label: 'ItemSend own check', packet: itemSend('ItemSend', 1, 1, 102, 3) },
  { label: 'ItemSend other pair', packet: itemSend('ItemSend', 2, 2, 500, 900) },
  { label: 'ItemSend other team', packet: itemSend('ItemSend', 1, 2, 101, 900, 1) },
  { label: 'ItemCheat', packet: itemSend('ItemCheat', 1, 1, 103, -1) },
  {
    label: 'Hint',
    packet: {
      cmd: 'PrintJSON', type: 'Hint', team: 0, receiving: 1, item: traceItem(103, 1, 3), found: false,
      data: [itemPart(103, 1), text(' is at '), locationPart(3, 1), text(' in '), playerPart(1)],
    },
  },
  { label: 'Chat', packet: slotPrint('Chat', 2, [text('Zelda: hello')], 'hello') },
  { label: 'ServerChat', packet: { cmd: 'PrintJSON', type: 'ServerChat', data: [text('[Server]: welcome')], message: 'welcome' } },
  { label: 'Join', packet: slotPrint('Join', 2, [playerPart(2), text(' joined')]) },
  { label: 'Part', packet: slotPrint('Part', 2, [playerPart(2), text(' left')]) },
  { label: 'Goal', packet: slotPrint('Goal', 2, [playerPart(2), text(' completed their goal')]) },
  { label: 'Release', packet: slotPrint('Release', 2, [playerPart(2), text(' released')]) },
  { label: 'Collect', packet: slotPrint('Collect', 2, [playerPart(2), text(' collected')]) },
  { label: 'untyped', packet: { cmd: 'PrintJSON', data: [text('plain server line')] } },
];

const FIRST_BATCH: ApServerPacket = {
  cmd: 'ReceivedItems', index: 0, items: [traceItem(100, 2, 900), traceItem(102, 1, -1)],
};

const GAP_BATCH: ApServerPacket = { cmd: 'ReceivedItems', index: 5, items: [traceItem(103, 2, 901)] };

const ROOM_UPDATE: ApServerPacket = {
  cmd: 'RoomUpdate',
  players: [{ team: 0, slot: 1, alias: 'Link', name: 'Link' }, { team: 0, slot: 2, alias: 'Princess Zelda', name: 'Zelda' }],
  checked_locations: [2],
};

const DEATH_LINK_BOUNCE: ApServerPacket = {
  cmd: 'Bounced', tags: ['DeathLink'], data: { source: 'Zelda', time: 0, cause: 'Zelda fell in a pit' },
};

export { DEATH_LINK_BOUNCE, FIRST_BATCH, GAP_BATCH, PRINT_PACKETS, ROOM_UPDATE };
