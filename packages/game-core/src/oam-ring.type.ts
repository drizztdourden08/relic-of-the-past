/* @layer bridge-wasm @kind types */
interface RingSlot {
  slot: number;
  y: number;
  yHigh: number;
  charnum: number;
  resolvedY: number;
  hidden: boolean;
  drawn: boolean;
  x: number;
  ext: number;
  resolvedX: number;
}

interface RingFrame {
  index: number;
  frame: number;
  playerScreenY: number;
  playerScreenX: number;
  cameraLockShiftY: number;
  cameraLockShiftX: number;
  tallBudget: number;
  renderExtraTop: number;
  renderExtraBottom: number;
  spriteBudgetHits: number;
  tileBudgetHits: number;
  slots: RingSlot[];
}

export type { RingFrame, RingSlot };
