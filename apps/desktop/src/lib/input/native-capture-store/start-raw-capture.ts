/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { RawCaptureStartResult } from '@shared/ipc';

const startRawCapture = (vendorId: number, productId: number): Promise<RawCaptureStartResult> =>
  appApi().startControllerRawCapture(vendorId, productId);

export { startRawCapture };
