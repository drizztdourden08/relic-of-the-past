/* @layer bridge-wasm @kind logic */
import type { CaptureResolve } from './capture-frame.type';

const captureState = {
  pending: null as CaptureResolve | null,
  pendingTimer: null as ReturnType<typeof setTimeout> | null,
};

export { captureState };
