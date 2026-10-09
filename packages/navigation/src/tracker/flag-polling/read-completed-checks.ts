/* @layer bridge-wasm @kind logic */
import { isCheckPhysicallyArmed } from '@rotp/randomizer';
import { computeCompletedChecks } from '../completed-checks-core';
import { outOfBedCheckId } from '../check-facts';
import { withCollectedChecks } from '../collected-checks';
import type { CheckId, ItemId } from '@rotp/game-data';
import { BED_STATE_RAM, OUT_OF_BED_STATE, SAVE_DUNG_INFO_RAM } from './flag-polling.constants';
import { roomWordReader } from './room-word-reader';
import type { WasmModule } from './flag-polling.type';

const readCompletedChecks = (mod: WasmModule, inventory: ReadonlySet<ItemId> | null = null): Set<CheckId> | null => {
  const heap = mod.HEAPU8;
  if (!heap) return null;

  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  let eventPtr = 0;
  try { eventPtr = mod.ccall('WasmGetEventBytes', 'number', [], []) as number; } catch { eventPtr = 0; }

  const words = roomPtr ? roomWordReader(heap, roomPtr, livePtr) : null;
  const newCompleted = computeCompletedChecks({
    readRoomWord: words ? words.read : null,
    readOwByte: owPtr ? (owScreen: number): number => heap[owPtr + owScreen] : null,
    readProgByte: progPtr ? (bufferIndex: number): number => heap[progPtr + bufferIndex] : null,
    readEventByte: eventPtr ? (byteIndex: number): number => heap[eventPtr + byteIndex] : null,
    inventory,
  }, isCheckPhysicallyArmed);

  if (roomPtr && heap[roomPtr - SAVE_DUNG_INFO_RAM + BED_STATE_RAM] >= OUT_OF_BED_STATE) {
    const id = outOfBedCheckId();
    if (id) newCompleted.add(id);
  }

  return withCollectedChecks(newCompleted);
};

export { readCompletedChecks };
