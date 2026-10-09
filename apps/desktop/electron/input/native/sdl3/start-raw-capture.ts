/* @layer electron-main @kind logic */
import type { RawCaptureResult } from './sdl3.type';
import { loadAddon } from './load-addon';

const startRawCapture = (vendorId: number, productId: number): RawCaptureResult => {
  return (
    loadAddon()?.startRawCapture(vendorId, productId) ?? {
      success: false,
      reason: 'error',
      message: 'native addon unavailable'
    }
  );
};

export { startRawCapture };
