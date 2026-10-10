/* @layer bridge-wasm @kind logic */
import { captureState } from './capture-state';
import { clearPending } from './clear-pending';
import { encodeVia2dCopy } from './encode-via-2d-copy';

const fulfillFrameCapture = (canvas: HTMLCanvasElement | null): void => {
  if (!captureState.pending || !canvas?.width || !canvas.height) return;
  const resolve = captureState.pending;
  clearPending();
  void encodeVia2dCopy(canvas).then(resolve);
};

export { fulfillFrameCapture };
