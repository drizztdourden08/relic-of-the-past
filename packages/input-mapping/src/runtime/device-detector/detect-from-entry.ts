/* @layer renderer-lib @kind logic */
import type { DetectedDevice } from '../../controls/devices/devices.type';
import type { DeviceFamily } from '@rotp/game-data';
import { resolveDeviceFromEntry } from '@drizztdourden08/brock-input';
import type { DeviceEntry } from '@drizztdourden08/brock-input';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const detectFromEntry = (entry: DeviceEntry): DetectedDevice => {
  const vendorId = toHex4(entry.vendorId);
  const productId = toHex4(entry.productId);
  const resolved = resolveDeviceFromEntry(entry);

  return {
    id: `hid-${vendorId}-${productId}`,
    type: 'gamepad',
    rawId: entry.product,
    vendorId,
    productId,
    deviceFamily: (resolved.brandLogoKey || 'generic') as DeviceFamily,
    displayName: resolved.name,
    sdlType: entry.sdlType ?? 'unknown',
    connected: entry.status === 'ready',
    activated: true,
    brandLogoKey: resolved.brandLogoKey || null,
    inputApi: 'hid',
    hasRumble: entry.hasRumble ?? false,
    hasGyro: entry.hasGyro ?? false,
  };
};

export { detectFromEntry };
