/* @layer bridge-wasm @kind logic */
import { readU8, callWhenRunning } from './wasm-call';
import type { PlayerStateInfo } from './player-state.type';
import { PLAYER_STATE_BYTE as Byte } from './player-state.constants';

const wasmGetPlayerStateInfo = (): PlayerStateInfo | null =>
  callWhenRunning<PlayerStateInfo | null>(null, (mod) => {
    const ptr = mod.ccall('WasmGetPlayerStateInfo', 'number', [], []);
    if (!ptr) return null;
    const b = mod.HEAPU8.subarray(ptr, ptr + 8);
    return {
      handlerState: readU8(b, Byte.handlerState),
      sleepStep: readU8(b, Byte.sleepStep),
      isRunning: b[Byte.isRunning] !== 0,
      isBunny: b[Byte.isBunny] !== 0,
      inDeepWater: b[Byte.inDeepWater] !== 0,
      grabbingWall: b[Byte.grabbingWall] !== 0,
      progressFlags: readU8(b, Byte.progressFlags),
      incapacitated: b[Byte.incapacitated] !== 0,
    };
  });

export { wasmGetPlayerStateInfo };
export type { PlayerStateInfo } from './player-state.type';
