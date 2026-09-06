/* @layer shared-game @kind logic */
/**
 * S1 census: reads the ROM's native chest table and produces the physical
 * ground truth used to verify the dataset's check records.
 *
 * Table layout (same parse as asset-extraction/compile-dungeon-rooms.ts):
 * base SNES address 0x81e96e, 168 entries, 3 bytes each, a little-endian
 * room word at +0 (bit 15 = big-chest flag, low 15 bits = room id) and an
 * item byte at +2. A chest's index is its order among the chests of its own
 * room in table order, matching the save bit assignment (0x10 << index).
 */
import { snesToLinear } from '../../asset-extraction/rom/snes-address';
import type { CheckRecord, ItemRecord } from '../../game/data/types';

const CHEST_TABLE_ADDR = 0x81e96e;
const CHEST_TABLE_COUNT = 168;
const COPIER_HEADER_SIZE = 512;

interface RomChest {
  roomId: number;
  chestIndex: number;
  itemByte: number;
  big: boolean;
}

interface RomCensus {
  chestsByRoom: Map<number, RomChest[]>;
  /** All entries in native table order: the order the address crosswalk indexes into. */
  flat: RomChest[];
  totalChests: number;
}

interface ChestMismatch {
  checkId: string;
  name: string;
  roomId: number | null;
  chestIndex: number | null;
  reason: string;
}

interface VanillaItemDiff {
  checkId: string;
  name: string;
  romItemByte: number;
  datasetReceiveId: number | null;
}

interface CensusFindings {
  chestMismatches: ChestMismatch[];
  vanillaItemDiffs: VanillaItemDiff[];
}

/** Strip a 512-byte copier header when present (file size ≡ 512 mod 1024). */
const stripCopierHeader = (romBytes: Uint8Array): Uint8Array =>
  romBytes.length % 1024 === COPIER_HEADER_SIZE ? romBytes.subarray(COPIER_HEADER_SIZE) : romBytes;

const readRomCensus = (romBytes: Uint8Array): RomCensus => {
  const bytes = stripCopierHeader(romBytes);
  const byteAt = (ea: number): number => bytes[snesToLinear(ea)];

  const chestsByRoom = new Map<number, RomChest[]>();
  const flat: RomChest[] = [];
  let totalChests = 0;

  for (let i = 0; i < CHEST_TABLE_COUNT; i++) {
    const entry = CHEST_TABLE_ADDR + i * 3;
    const roomWord = byteAt(entry) | (byteAt(entry + 1) << 8);
    const itemByte = byteAt(entry + 2);
    const roomId = roomWord & 0x7fff;
    const big = (roomWord & 0x8000) !== 0;

    const roomChests = chestsByRoom.get(roomId) ?? [];
    const chest: RomChest = { roomId, chestIndex: roomChests.length, itemByte, big };
    roomChests.push(chest);
    chestsByRoom.set(roomId, roomChests);
    flat.push(chest);
    totalChests += 1;
  }

  return { chestsByRoom, flat, totalChests };
};

/** Cross-check dataset chest checks against the census. Pure: no I/O, no logging. */
const censusFindings = (
  census: RomCensus,
  checks: readonly CheckRecord[],
  items: readonly ItemRecord[],
): CensusFindings => {
  const receiveIdByItemId = new Map<string, number | null>();
  for (const item of items) {
    receiveIdByItemId.set(item.id, item.gameId?.receiveItemId ?? null);
  }

  const chestMismatches: ChestMismatch[] = [];
  const vanillaItemDiffs: VanillaItemDiff[] = [];

  for (const check of checks) {
    if (check.kind !== 'chest') continue;
    const { roomId, chestIndex } = check.gameId;

    if (roomId === undefined || chestIndex === undefined) {
      chestMismatches.push({
        checkId: check.id, name: check.randomizerName,
        roomId: roomId ?? null, chestIndex: chestIndex ?? null,
        reason: 'missing roomId/chestIndex in gameId',
      });
      continue;
    }

    const romChest = census.chestsByRoom.get(roomId)?.find((c) => c.chestIndex === chestIndex);
    if (!romChest) {
      chestMismatches.push({
        checkId: check.id, name: check.randomizerName, roomId, chestIndex,
        reason: 'no chest at (roomId, chestIndex) in the native table',
      });
      continue;
    }

    const firstVanillaId = check.vanillaItemIds[0];
    const datasetReceiveId = firstVanillaId === undefined
      ? null
      : (receiveIdByItemId.get(firstVanillaId) ?? null);
    if (datasetReceiveId !== romChest.itemByte) {
      vanillaItemDiffs.push({
        checkId: check.id, name: check.randomizerName,
        romItemByte: romChest.itemByte, datasetReceiveId,
      });
    }
  }

  return { chestMismatches, vanillaItemDiffs };
};

export { censusFindings, readRomCensus };
export type { CensusFindings, ChestMismatch, RomCensus, RomChest, VanillaItemDiff };
