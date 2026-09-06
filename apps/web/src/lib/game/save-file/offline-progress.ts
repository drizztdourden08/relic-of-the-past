/* @layer bridge-wasm @kind logic */
/**
 * Offline completed-check read for one battery-save file: adapts a valid
 * slot block to the same three readers the live poller feeds the shared
 * sweep, so both paths agree byte-for-byte on what "done" means. The live
 * folding of the currently loaded room and the live-WRAM sleep byte have no
 * offline counterpart — a save on disk has no loaded room, and the sleep
 * check resolves through the progress-indicator fallback instead.
 */
import { computeCompletedChecks } from '../tracker/completed-checks-core';
import { slotBlockOffset } from './sram-slots';
import { OW_EVENT_BASE, PROGRESS_OFFSETS, ROOM_FLAGS_BASE } from './progress-offsets';
import type { CheckId } from '@shared/game/data';

/**
 * The completed checks recorded in one battery-save slot, or null when the
 * slot holds no valid game (empty or corrupt). `isArmed` carries the
 * substitution routing: true for a check the placement physically arms, so
 * its completion reads the real taken-bit instead of a possession proxy.
 */
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
  return computeCompletedChecks({ readRoomWord, readOwByte, readProgByte }, isArmed);
};

export { offlineCompletedChecks };
