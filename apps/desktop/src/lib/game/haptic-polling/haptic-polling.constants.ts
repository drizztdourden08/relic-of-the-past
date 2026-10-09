/* @layer bridge-wasm @kind constants */
const PLAYER_STATE = {
  ground: 0,
  fallingIntoHole: 1,
  spinAttack: 3,
  swimming: 4,
  hopSouth: 11,
  fallOffLeftRightLedge: 12,
  jumpOffLedgeDiag: 14,
  startDash: 17,
  crossingWorlds: 20,
} as const;

const LEDGE_JUMP_STATES: readonly number[] = [
  PLAYER_STATE.fallOffLeftRightLedge, PLAYER_STATE.jumpOffLedgeDiag, PLAYER_STATE.hopSouth,
];

const UI_STATE_OFFSET = {
  mainModule: 0,
  handlerState: 115,
  isRunning: 116,
  dashCounter: 117,
} as const;

const DASH_CHARGED_FROM = 32;
const DASH_CHARGED_BELOW = 64;

const GAME_OVER_MODULE = 18;

export { PLAYER_STATE, LEDGE_JUMP_STATES, UI_STATE_OFFSET, DASH_CHARGED_FROM, DASH_CHARGED_BELOW, GAME_OVER_MODULE };
