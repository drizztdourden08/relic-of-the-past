/* @layer bridge-wasm @kind logic */
import { computeCompletedChecks } from '../tracker/completed-checks-core';
import { slotBlockOffset } from '@rotp/game-core';
import { OW_EVENT_BASE, PROGRESS_OFFSETS, ROOM_FLAGS_BASE } from '@rotp/game-core';
import { SRM_EVENT_LEDGER } from '@rotp/game-core';
import { blockOffsetOf } from '@rotp/game-core';
import type { CheckId } from '@rotp/game-data';

const offlineCompletedChecks = (
  sram: Uint8Array,
  slot: number,
  isArmed: (checkId: string) => boolean,
): Set<CheckId> | null => {
  const base = slotBlockOffset(sram, slot);
  if (base === null) return null;
  const readRoomWord = (roomId: number): number =>
    sram[base + ROOM_FLAGS_BASE + roomId * 2] | (sram[base + ROOM_FLAGS_BASE + roomId * 2 + 1] << 8);
  const readOwByte = (owScreen: number): number => sram[base + OW_EVENT_BASE + owScreen];
  const readProgByte = (bufferIndex: number): number => {
    const offset = PROGRESS_OFFSETS[bufferIndex];
    return offset === null || offset === undefined ? 0 : sram[base + offset];
  };
  const readEventByte = (byteIndex: number): number => sram[base + blockOffsetOf(SRM_EVENT_LEDGER) + byteIndex];
  return computeCompletedChecks({ readRoomWord, readOwByte, readProgByte, readEventByte }, isArmed);
};

export { offlineCompletedChecks };
