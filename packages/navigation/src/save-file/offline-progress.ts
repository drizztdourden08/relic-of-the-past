/* @layer bridge-wasm @kind logic */
import { computeCompletedChecks } from '../tracker/completed-checks-core';
import { slotBlockOffset, OW_EVENT_BASE, PROGRESS_OFFSETS, ROOM_FLAGS_BASE, SRM_EVENT_LEDGER, blockOffsetOf } from '@rotp/game-core';
import { itemAt } from '../checked-access';
import type { CheckId } from '@rotp/game-data';

const offlineCompletedChecks = (
  sram: Uint8Array,
  slot: number,
  isArmed: (checkId: string) => boolean,
): Set<CheckId> | null => {
  const base = slotBlockOffset(sram, slot);
  if (base === null) return null;
  const readRoomWord = (roomId: number): number =>
    (sram[base + ROOM_FLAGS_BASE + roomId * 2] ?? 0) | ((sram[base + ROOM_FLAGS_BASE + roomId * 2 + 1] ?? 0) << 8);
  const readOwByte = (owScreen: number): number => sram[base + OW_EVENT_BASE + owScreen] ?? 0;
  const readProgByte = (bufferIndex: number): number => {
    const offset = PROGRESS_OFFSETS[bufferIndex];
    return offset === null || offset === undefined ? 0 : itemAt(sram, base + offset);
  };
  const readEventByte = (byteIndex: number): number => sram[base + blockOffsetOf(SRM_EVENT_LEDGER) + byteIndex] ?? 0;
  return computeCompletedChecks({ readRoomWord, readOwByte, readProgByte, readEventByte }, isArmed);
};

export { offlineCompletedChecks };
