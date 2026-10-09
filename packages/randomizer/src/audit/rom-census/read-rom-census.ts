/* @layer shared-game @kind logic */
import { snesToLinear } from '@rotp/asset-extraction';
import { CHEST_TABLE_COUNT, CHEST_TABLE_ENTRY_SIZE, CHEST_TABLE_SNES_ADDRESS } from '../audit.constants';
import { stripCopierHeader } from '../strip-copier-header';
import { BIG_CHEST_FLAG, CHEST_ITEM_BYTE_OFFSET, ROOM_ID_MASK } from './rom-census.constants';
import type { RomCensus, RomChest } from './rom-census.type';

const readRomCensus = (romBytes: Uint8Array): RomCensus => {
  const bytes = stripCopierHeader(romBytes);
  const byteAt = (ea: number): number => bytes[snesToLinear(ea)];

  const chestsByRoom = new Map<number, RomChest[]>();
  const flat: RomChest[] = [];
  let totalChests = 0;

  for (let i = 0; i < CHEST_TABLE_COUNT; i++) {
    const entry = CHEST_TABLE_SNES_ADDRESS + i * CHEST_TABLE_ENTRY_SIZE;
    const roomWord = byteAt(entry) | (byteAt(entry + 1) << 8);
    const itemByte = byteAt(entry + CHEST_ITEM_BYTE_OFFSET);
    const roomId = roomWord & ROOM_ID_MASK;
    const big = (roomWord & BIG_CHEST_FLAG) !== 0;

    const roomChests = chestsByRoom.get(roomId) ?? [];
    const chest: RomChest = { roomId, chestIndex: roomChests.length, itemByte, big };
    roomChests.push(chest);
    chestsByRoom.set(roomId, roomChests);
    flat.push(chest);
    totalChests += 1;
  }

  return { chestsByRoom, flat, totalChests };
};

export { readRomCensus };
