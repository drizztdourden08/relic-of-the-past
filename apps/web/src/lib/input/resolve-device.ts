/* @layer renderer-lib @kind logic */
/**
 * Renderer-side resolver from a DeviceEntry (the SDL3 controller snapshot)
 * to a ResolvedDevice: the single place both the calibration cards
 * (InputTester) and the controls screen (ProfileHub) ask "what does this
 * device have, and how do I show it". SDL's own hasButton/hasAxis/
 * buttonLabels decide what exists; the family layer (shared/input/family)
 * only decides how to label/icon it. Neither a preset nor DEVICE_DATABASE
 * is consulted here, so the two screens can no longer disagree; they both
 * call this.
 */
import {
  buildDisplayContext,
  resolveBrandLogoKey,
  resolveDeviceControls,
  resolveDeviceName,
} from '@shared/input/family';
import type { ResolvedDevice, SdlGamepadType } from '@shared/input/family';
import type { DeviceEntry } from '@shared/ipc';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

/**
 * Resolves one snapshot entry. An 'unavailable' entry was never opened by
 * SDL, so it carries no hasButton/hasAxis/buttonLabels; those default to
 * empty arrays here, which resolveDeviceControls turns into an empty
 * control list rather than a guess.
 */
const resolveDeviceFromEntry = (entry: DeviceEntry): ResolvedDevice => {
  const vendorId = toHex4(entry.vendorId);
  const productId = toHex4(entry.productId);
  const sdlType: SdlGamepadType = (entry.sdlType as SdlGamepadType | undefined) ?? 'unknown';
  const hasButton = entry.hasButton ?? [];
  const hasAxis = entry.hasAxis ?? [];
  const buttonLabels = entry.buttonLabels ?? [];

  const ctx = buildDisplayContext({ sdlType, vendorId, productId });
  const rawName = entry.name || entry.product || `${vendorId}:${productId}`;

  return {
    deviceKey: entry.deviceKey,
    name: resolveDeviceName(ctx, rawName),
    sdlType,
    brandLogoKey: resolveBrandLogoKey(ctx),
    hasRumble: entry.hasRumble ?? false,
    hasGyro: entry.hasGyro ?? false,
    connection: entry.connectionState ?? entry.busType ?? 'unknown',
    controls: resolveDeviceControls({ sdlType, vendorId, productId, hasButton, hasAxis, buttonLabels }),
  };
};

export { resolveDeviceFromEntry };
