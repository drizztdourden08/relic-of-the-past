/* @layer renderer-components @kind logic */
import { buildDeviceProfileFromResolved } from '@shared/input';
import type { DeviceProfile } from '@shared/input';
import type { ResolvedDevice } from '@shared/input/family';
import type { DeviceFamily } from '@shared/types/controls';
import { toHex4 } from './to-hex4';

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

export { buildProfileFromResolved };
