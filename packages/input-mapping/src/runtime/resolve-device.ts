/* @layer renderer-lib @kind logic */
import {
  buildDisplayContext,
  resolveBrandLogoKey,
  resolveDeviceControls,
  resolveDeviceName,
} from '../family';
import type { ResolvedDevice, SdlGamepadType } from '../family';
import type { DeviceEntry } from '@drizztdourden08/brock-input';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const textOr = (value: string | undefined, fallback: string): string => (value === undefined || value === '' ? fallback : value);

const resolveDeviceFromEntry = (entry: DeviceEntry): ResolvedDevice => {
  const vendorId = toHex4(entry.vendorId);
  const productId = toHex4(entry.productId);
  const sdlType: SdlGamepadType = (entry.sdlType) ?? 'unknown';
  const hasButton = entry.hasButton ?? [];
  const hasAxis = entry.hasAxis ?? [];
  const buttonLabels = entry.buttonLabels ?? [];

  const ctx = buildDisplayContext({ sdlType, vendorId, productId });
  const rawName = textOr(entry.name, textOr(entry.product, `${vendorId}:${productId}`));

  return {
    deviceKey: entry.deviceKey,
    name: resolveDeviceName(ctx, rawName),
    sdlType,
    brandLogoKey: resolveBrandLogoKey(ctx),
    hasRumble: entry.hasRumble ?? false,
    hasGyro: entry.hasGyro ?? false,
    connection: entry.connectionState ?? entry.busType,
    controls: resolveDeviceControls({ sdlType, vendorId, productId, hasButton, hasAxis, buttonLabels }),
  };
};

export { resolveDeviceFromEntry };
