/* @layer renderer-lib @kind logic */
import type { RawCaptureStartResult } from '@shared/ipc';

const startRawCapture = (vendorId: number, productId: number): Promise<RawCaptureStartResult> =>
  window.api.startControllerRawCapture(vendorId, productId);

export { startRawCapture };
