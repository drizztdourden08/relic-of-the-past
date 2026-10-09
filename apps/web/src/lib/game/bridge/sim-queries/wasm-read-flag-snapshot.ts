/* @layer bridge-wasm @kind logic */
import { callWhenRunning, readU16 } from '../wasm-call';
import { DUNG_INFO_LEN, OW_EVENT_LEN, PROGRESS_LEN } from './sim-queries.constants';
import type { SimFlagSnapshot } from './sim-queries.type';

const wasmReadFlagSnapshot = (): SimFlagSnapshot | null =>
  callWhenRunning<SimFlagSnapshot | null>(null, (mod) => {
    const heap = mod.HEAPU8;
    const dungPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
    const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!dungPtr || !owPtr || !progPtr) return null;
    const dungInfo = new Uint16Array(DUNG_INFO_LEN);
    for (let i = 0; i < DUNG_INFO_LEN; i++) dungInfo[i] = readU16(heap, dungPtr + i * 2);
    return {
      dungInfo,
      owEventInfo: heap.slice(owPtr, owPtr + OW_EVENT_LEN),
      progress: heap.slice(progPtr, progPtr + PROGRESS_LEN),
    };
  });

export { wasmReadFlagSnapshot };
