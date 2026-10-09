/* @layer shared-input @kind logic */
import { profileFromControls } from './profile-from-controls';
import type { ResolvedDevice } from '../family';
import type { DeviceProfile, DeviceProfileIdentity } from './device-profile.type';

const buildDeviceProfileFromResolved = (identity: DeviceProfileIdentity, resolved: ResolvedDevice): DeviceProfile =>
  profileFromControls(identity, resolved.controls);

export { buildDeviceProfileFromResolved };
