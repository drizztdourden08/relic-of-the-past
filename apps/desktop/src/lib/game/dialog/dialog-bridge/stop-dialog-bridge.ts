/* @layer bridge-wasm @kind logic */
import { INACTIVE_FRAME } from '../parse-dialog-state';
import { dialogBridgeState } from './dialog-bridge-state';

const stopDialogBridge = (): void => {
  dialogBridgeState.frameUpdater?.(INACTIVE_FRAME);
  dialogBridgeState.frameUpdater = null;
  dialogBridgeState.prevFrame = null;
};

export { stopDialogBridge };
