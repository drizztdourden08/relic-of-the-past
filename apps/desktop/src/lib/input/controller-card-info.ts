/* @layer renderer-lib @kind logic */
import { resolveDeviceFromEntry } from './resolve-device';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { DeviceFamily } from '@shared/types/controls';
import type { ControllerCardInfo } from './controller-card-info.type';

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
