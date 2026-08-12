/* @layer renderer-lib @kind logic */
/**
 * SDL gamepad type for every controller seen this session, recorded from the
 * controller snapshot and kept live by controller:added (see
 * seed-device-cache.ts) rather than that one-shot event alone. Family display
 * metadata (icons, labels, console defaults) is keyed entirely by this type,
 * so this is the only way to resolve it for a saved binding or a
 * drag-and-drop payload whose device is not currently plugged in.
 */
import type { ControllerGamepadType } from '@shared/ipc';
import { seedPerDeviceCache } from './seed-device-cache';

const byVidPid = new Map<string, ControllerGamepadType>();

const hex4 = (value: number): string => value.toString(16).padStart(4, '0');

const vidPidKey = (vendorId: number, productId: number): string => `${hex4(vendorId)}:${hex4(productId)}`;

/** Records the SDL type a device reported at connect. */
const rememberControllerSdlType = (params: { vendorId: number; productId: number; sdlType: ControllerGamepadType }): void => {
  const { vendorId, productId, sdlType } = params;
  byVidPid.set(vidPidKey(vendorId, productId), sdlType);
};

/** Best known SDL type for a vid:pid, or null if never seen this session. */
const recallControllerSdlType = (vendorId: number, productId: number): ControllerGamepadType | null => {
  return byVidPid.get(vidPidKey(vendorId, productId)) ?? null;
};

let unsubscribe: (() => void) | null = null;

/** Starts recording, once per session. Seeded from the current controller
 *  snapshot immediately, then kept live by controller:devices and
 *  controller:added (same shape as controller-name-cache.ts), so a device
 *  attached before any screen asks for its type still has one recorded. */
const startControllerFamilyCache = (): (() => void) => {
  if (unsubscribe) return () => { /* already recording for this session */ };
  unsubscribe = seedPerDeviceCache((fields) => {
    if (!fields.sdlType) return;
    rememberControllerSdlType({ vendorId: fields.vendorId, productId: fields.productId, sdlType: fields.sdlType });
  });
  return () => { /* deliberately never torn down; the cache outlives any screen */ };
};

if (typeof window !== 'undefined') {
  startControllerFamilyCache();
}

export { recallControllerSdlType, rememberControllerSdlType, startControllerFamilyCache };
