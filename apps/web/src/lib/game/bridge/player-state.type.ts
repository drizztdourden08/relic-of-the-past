/* @layer bridge-wasm @kind types */
interface PlayerStateInfo {
  handlerState: number;
  sleepStep: number;
  isRunning: boolean;
  isBunny: boolean;
  inDeepWater: boolean;
  grabbingWall: boolean;
  progressFlags: number;
  incapacitated: boolean;
}

export type { PlayerStateInfo };
