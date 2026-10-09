/* @layer bridge-wasm @kind logic */
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';

const dialogBridgeState: {
  prevFrame: DialogFrame | null;
  frameUpdater: ((frame: DialogFrame) => void) | null;
} = { prevFrame: null, frameUpdater: null };

export { dialogBridgeState };
