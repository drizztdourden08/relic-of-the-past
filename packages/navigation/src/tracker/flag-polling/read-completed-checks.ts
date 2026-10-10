/* @layer bridge-wasm @kind logic */
import { isCheckPhysicallyArmed } from '@rotp/randomizer';
import { computeCompletedChecks } from '../completed-checks-core';
import type { ProgressReaders } from '../completed-checks-core';
import { outOfBedCheckId } from '../check-facts';
import { withCollectedChecks } from '../collected-checks';
import type { CheckId, ItemId } from '@rotp/game-data';
import { BED_STATE_RAM, OUT_OF_BED_STATE, SAVE_DUNG_INFO_RAM } from './flag-polling.constants';
import { roomWordReader } from './room-word-reader';
import { itemAt } from '../../checked-access';
import type { WasmModule } from './flag-polling.type';

const byteReaders = (heap: Uint8Array, ptrs: { owPtr: number; progPtr: number; eventPtr: number }): Pick<ProgressReaders, 'readOwByte' | 'readProgByte' | 'readEventByte'> => {
  const { owPtr, progPtr, eventPtr } = ptrs;
  return {
    readOwByte: owPtr ? (owScreen: number): number => heap[owPtr + owScreen] ?? 0 : null,
    readProgByte: progPtr ? (bufferIndex: number): number => itemAt(heap, progPtr + bufferIndex) : null,
    readEventByte: eventPtr ? (byteIndex: number): number => heap[eventPtr + byteIndex] ?? 0 : null,
  };
};

const readCompletedChecks = (mod: WasmModule, inventory: ReadonlySet<ItemId> | null = null): Set<CheckId> | null => {
  const heap = mod.HEAPU8;
  if (!heap) return null;

  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  let eventPtr: number;
  try { eventPtr = mod.ccall('WasmGetEventBytes', 'number', [], []) as number; } catch { eventPtr = 0; }

  const newCompleted = computeCompletedChecks({
    readRoomWord: roomPtr ? roomWordReader(heap, roomPtr, livePtr).read : null,
    ...byteReaders(heap, { owPtr, progPtr, eventPtr }),
    inventory,
  }, isCheckPhysicallyArmed);

  if (roomPtr && itemAt(heap, roomPtr - SAVE_DUNG_INFO_RAM + BED_STATE_RAM) >= OUT_OF_BED_STATE) {
    const id = outOfBedCheckId();
    if (id) newCompleted.add(id);
  }

  return withCollectedChecks(newCompleted);
};

export { readCompletedChecks };
