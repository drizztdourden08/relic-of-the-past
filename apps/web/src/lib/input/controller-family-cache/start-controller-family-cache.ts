/* @layer renderer-lib @kind logic */
import { seedPerDeviceCache } from '../seed-device-cache';
import { rememberControllerSdlType } from './remember-controller-sdl-type';

const recording: { unsubscribe: (() => void) | null } = { unsubscribe: null };

const keepRecording = (): void => undefined;

const startControllerFamilyCache = (): (() => void) => {
  if (recording.unsubscribe) return keepRecording;
  recording.unsubscribe = seedPerDeviceCache((fields) => {
    if (!fields.sdlType) return;
    rememberControllerSdlType({ vendorId: fields.vendorId, productId: fields.productId, sdlType: fields.sdlType });
  });
  return keepRecording;
};

if (typeof window !== 'undefined') {
  startControllerFamilyCache();
}

export { startControllerFamilyCache };
