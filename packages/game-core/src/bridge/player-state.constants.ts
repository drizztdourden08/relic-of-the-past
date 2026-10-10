/* @layer bridge-wasm @kind constants */
const PLAYER_STATE_BYTE = {
  handlerState: 0,
  sleepStep: 1,
  isRunning: 2,
  isBunny: 3,
  inDeepWater: 4,
  grabbingWall: 5,
  progressFlags: 6,
  incapacitated: 7,
} as const;

export { PLAYER_STATE_BYTE };
