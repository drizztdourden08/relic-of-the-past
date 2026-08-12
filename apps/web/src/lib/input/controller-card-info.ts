/* @layer renderer-lib @kind logic */
/**
 * Resolves a controller snapshot entry's display name, family, and SDL type
 * for a card. Name and family come from the SDL-driven resolver
 * (resolve-device.ts): SDL's own report plus the family layer's display
 * metadata, never a hand-authored database guess. sdlType is carried through
 * for the controls screen's "apply console defaults" drag-and-drop flow,
 * which resolves consoleDefaults from it via the family layer.
 */
import { resolveDeviceFromEntry } from './resolve-device';
import type { DeviceEntry } from '@shared/ipc';
import type { DeviceFamily } from '@shared/types/controls';

interface ControllerCardInfo {
  vendorId: string;
  productId: string;
  deviceFamily: DeviceFamily;
  displayName: string;
  sdlType: string | null;
}

const toHex = (value: number): string => value.toString(16).padStart(4, '0');

const controllerCardInfo = (entry: DeviceEntry): ControllerCardInfo => {
  const vendorId = toHex(entry.vendorId);
  const productId = toHex(entry.productId);
  const resolved = resolveDeviceFromEntry(entry);

  return {
    vendorId,
    productId,
    deviceFamily: (resolved.brandLogoKey || 'generic') as DeviceFamily,
    displayName: resolved.name,
    sdlType: entry.sdlType ?? 'unknown',
  };
};

export { controllerCardInfo };
export type { ControllerCardInfo };
