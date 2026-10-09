/* @layer shared-input @kind logic */
import { buildDeviceProfile } from './build-device-profile';
import { ALL_AXES, ALL_BUTTONS } from './device-profile.constants';
import type { SdlGamepadType } from '../family';
import type { DeviceProfile, DeviceProfileIdentity } from './device-profile.type';

const buildDeviceProfileFromSdlType = (identity: DeviceProfileIdentity, sdlType: SdlGamepadType): DeviceProfile =>
  buildDeviceProfile(identity, { sdlType, hasButton: ALL_BUTTONS, hasAxis: ALL_AXES });

export { buildDeviceProfileFromSdlType };
