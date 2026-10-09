/* @layer shared-input @kind logic */
import { resolveDeviceControls } from '../family';
import { profileFromControls } from './profile-from-controls';
import type { DeviceProfile, DeviceProfileIdentity, LiveCapabilities } from './device-profile.type';

const buildDeviceProfile = (identity: DeviceProfileIdentity, params: LiveCapabilities): DeviceProfile => {
  const controls = resolveDeviceControls({
    sdlType: params.sdlType,
    vendorId: identity.vendorId,
    productId: identity.productId,
    hasButton: params.hasButton,
    hasAxis: params.hasAxis,
    buttonLabels: params.buttonLabels ?? [],
  });
  return profileFromControls(identity, controls);
};

export { buildDeviceProfile };
