/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from './wasm-call';
import type { PlayerStateInfo } from './player-state.type';

const enum Byte {
  handlerState = 0,
  sleepStep = 1,
  isRunning = 2,
  isBunny = 3,
  inDeepWater = 4,
  grabbingWall = 5,
  progressFlags = 6,
  incapacitated = 7,
}

const wasmGetPlayerStateInfo = (): PlayerStateInfo | null =>
  callWhenRunning<PlayerStateInfo | null>(null, (mod) => {
    const ptr = mod.ccall('WasmGetPlayerStateInfo', 'number', [], []) as number;
    if (!ptr) return null;
    const b = mod.HEAPU8.subarray(ptr, ptr + 8);
    return {
      handlerState: b[Byte.handlerState],
      sleepStep: b[Byte.sleepStep],
      isRunning: b[Byte.isRunning] !== 0,
      isBunny: b[Byte.isBunny] !== 0,
      inDeepWater: b[Byte.inDeepWater] !== 0,
      grabbingWall: b[Byte.grabbingWall] !== 0,
      progressFlags: b[Byte.progressFlags],
      incapacitated: b[Byte.incapacitated] !== 0,
    };
  });

export { wasmGetPlayerStateInfo };
export type { PlayerStateInfo } from './player-state.type';
