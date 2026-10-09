/* @layer bridge-wasm @kind logic */
import type { DialogFrame } from '@rotp/game-data';

const dialogBridgeState: {
  prevFrame: DialogFrame | null;
  frameUpdater: ((frame: DialogFrame) => void) | null;
} = { prevFrame: null, frameUpdater: null };

export { dialogBridgeState };
