/* @layer bridge-wasm @kind logic */
import type { DialogFrame } from '@rotp/game-data';
import { dialogBridgeState } from './dialog-bridge-state';

const initDialogBridge = (updater: (frame: DialogFrame) => void): void => {
  dialogBridgeState.frameUpdater = updater;
  dialogBridgeState.prevFrame = null;
};

export { initDialogBridge };
