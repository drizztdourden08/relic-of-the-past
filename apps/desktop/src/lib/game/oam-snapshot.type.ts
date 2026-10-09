/* @layer bridge-wasm @kind types */
interface OamSlot {
  slot: number;
  xLow: number;
  y: number;
  charnum: number;
  flags: number;
  ext: number;
  xHigh: number;
  yHigh: number;
  isPlayer: boolean;
  resolvedX: number;
  resolvedY: number;
  hidden: boolean;
}

interface SpriteSlot {
  slot: number;
  state: number;
  pause: number;
  inBand: boolean;
  type: number;
  screenX: number;
  screenY: number;
}

interface OamSnapshot {
  playerBase: number;
  playerScreenX: number;
  playerScreenY: number;
  wideBudget: number;
  tallBudget: number;
  cameraLockShiftX: number;
  visibilityStatus: number;
  blinkCountdown: number;
  hide: {
    ran: boolean;
    offscreenYBranch: boolean;
    stockExtBranch: boolean;
    submodule: number;
    blinkAsSeen: number;
    inDoorway: boolean;
    capeMode: number;
    shadowOamPos: number | null;
  };
  slots: OamSlot[];
  mainModule: number;
  submodule: number;
  overworldMapState: number;
  savedModuleForMenu: number;
  renderExtraLeft: number;
  renderExtraRight: number;
  bandLoX: number;
  bandHiX: number;
  renderExtraTop: number;
  renderExtraBottom: number;
  tallBudgetConfigured: number;
  cameraLockShiftY: number;
  sprites: SpriteSlot[];
}

export type { OamSnapshot, OamSlot, SpriteSlot };
