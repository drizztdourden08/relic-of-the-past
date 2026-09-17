/* @layer bridge-wasm @kind logic */
/**
 * Per-frame read of the dialog mirror, run from the UI bridge's animation-frame loop. Only a
 * changed frame reaches the store. Off (a closed gate) reads as an inactive frame, so the host
 * box stands down the moment the override is refused.
 */
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';
import { wasmGetDialogState } from '../bridge/dialog';
import { dialogFrameChanged } from './dialog-frame-diff';
import { INACTIVE_FRAME, parseDialogState } from './parse-dialog-state';

let prevFrame: DialogFrame | null = null;
let frameUpdater: ((frame: DialogFrame) => void) | null = null;

const pollDialogFrame = (): void => {
  if (!frameUpdater) return;
  const view = wasmGetDialogState();
  const frame = view ? parseDialogState(view.heap, view.ptr) : INACTIVE_FRAME;
  if (!prevFrame || dialogFrameChanged(prevFrame, frame)) {
    prevFrame = frame;
    frameUpdater(frame);
  }
};

const initDialogBridge = (updater: (frame: DialogFrame) => void): void => {
  frameUpdater = updater;
  prevFrame = null;
};

const stopDialogBridge = (): void => {
  frameUpdater = null;
  prevFrame = null;
};

export { initDialogBridge, pollDialogFrame, stopDialogBridge };
