/* @layer bridge-wasm @kind logic */
import { INACTIVE_FRAME } from '../parse-dialog-state';
import { dialogBridgeState } from './dialog-bridge-state';

const resyncDialogFrames = (): void => {
  dialogBridgeState.frameUpdater?.(INACTIVE_FRAME);
  dialogBridgeState.prevFrame = null;
};

export { resyncDialogFrames };
