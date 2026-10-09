/* @layer bridge-wasm @kind logic */
import { wasmGetDialogState } from '../../bridge/dialog';
import { dialogFrameChanged } from '../dialog-frame-diff';
import { INACTIVE_FRAME, parseDialogState } from '../parse-dialog-state';
import { dialogBridgeState } from './dialog-bridge-state';

const pollDialogFrame = (): void => {
  const state = dialogBridgeState;
  if (!state.frameUpdater) return;
  const view = wasmGetDialogState();
  const frame = view ? parseDialogState(view.heap, view.ptr) : INACTIVE_FRAME;
  if (!state.prevFrame || dialogFrameChanged(state.prevFrame, frame)) {
    state.prevFrame = frame;
    state.frameUpdater(frame);
  }
};

export { pollDialogFrame };
