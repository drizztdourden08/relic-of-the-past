/* @layer bridge-wasm @kind logic */
/**
 * Live player-state bytes for the widget's state chips (WasmGetPlayerStateInfo).
 *
 * Separate from the flag snapshot on purpose: the simulator DIFFS that buffer to
 * detect checks, and these values change every frame, so folding them in there
 * would fabricate check events.
 */
import { callWhenRunning } from './wasm-call';

/** Byte layout, mirroring state_queries.c. */
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

interface PlayerStateInfo {
  /** kPlayerState_* says what the player handler is doing right now. */
  handlerState: number;
  /** Step INSIDE the sleeping handler (0 while actually asleep). */
  sleepStep: number;
  /** Dashing with the Pegasus boots. */
  isRunning: boolean;
  isBunny: boolean;
  inDeepWater: boolean;
  grabbingWall: boolean;
  /** sram_progress_flags holds the named story bits. */
  progressFlags: number;
  /** Nonzero while stunned or recoiling. */
  incapacitated: boolean;
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
export type { PlayerStateInfo };
