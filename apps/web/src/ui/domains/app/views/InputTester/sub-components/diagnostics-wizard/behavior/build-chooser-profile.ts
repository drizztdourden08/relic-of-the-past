/* @layer renderer-components @kind logic */
/**
 * The calibration-profile view for a resolved device, shared by the live
 * chooser candidate and the frozen post-capture candidate in
 * useDiagnosticsWizardState.ts, which otherwise built the same DeviceProfile
 * shape twice from two different vendor/product sources.
 */
import { buildDeviceProfileFromResolved } from '@shared/input';
import type { DeviceProfile } from '@shared/input';
import type { ResolvedDevice } from '@shared/input/family';
import type { DeviceFamily } from '@shared/types/controls';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const buildProfileFromResolved = (resolved: ResolvedDevice, vendorId: number, productId: number): DeviceProfile =>
  buildDeviceProfileFromResolved(
    {
      id: resolved.sdlType,
      name: resolved.name,
      family: (resolved.brandLogoKey || 'generic') as DeviceFamily,
      inputApi: 'hid',
      vendorId: toHex4(vendorId),
      productId: toHex4(productId),
    },
    resolved,
  );

export { buildProfileFromResolved, toHex4 };
