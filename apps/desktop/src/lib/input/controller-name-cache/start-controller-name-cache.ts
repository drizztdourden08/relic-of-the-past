/* @layer renderer-lib @kind logic */
import { seedPerDeviceCache } from '../seed-device-cache';
import { rememberControllerName } from '@rotp/input-mapping';

const recording: { unsubscribe: (() => void) | null } = { unsubscribe: null };

const keepRecording = (): void => undefined;

const startControllerNameCache = (): (() => void) => {
  if (recording.unsubscribe) return keepRecording;
  recording.unsubscribe = seedPerDeviceCache((fields) => {
    if (!fields.name) return;
    rememberControllerName({
      deviceKey: fields.deviceKey,
      vendorId: fields.vendorId,
      productId: fields.productId,
      name: fields.name,
    });
  });
  return keepRecording;
};

if (typeof window !== 'undefined') {
  startControllerNameCache();
}

export { startControllerNameCache };
