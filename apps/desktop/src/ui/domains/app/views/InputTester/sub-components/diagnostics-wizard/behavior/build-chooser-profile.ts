/* @layer renderer-components @kind logic */
import { buildDeviceProfileFromResolved } from '@rotp/input-mapping';
import type { DeviceProfile } from '@rotp/input-mapping';
import type { ResolvedDevice } from '@rotp/input-mapping';
import type { DeviceFamily } from '@rotp/game-data';
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
