/* @layer renderer-lib @kind logic */
import { defaultCoreBindings, keyboardModernBindings } from '../../scheme';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { CoreBindings } from '@rotp/game-data';
import type { InputProfile } from '../../controls/devices/devices.type';
import { resolveDeviceFromEntry } from '../resolve-device';
import { profileDevice } from './profile-device';

const resolveCoreBindings = (profile: InputProfile | null, devices: readonly DeviceEntry[]): CoreBindings | null => {
  if (!profile) return null;
  if (profile.core) return profile.core;
  if (profile.modern) return profile.modern.core;
  if (profile.deviceType === 'keyboard') return keyboardModernBindings().core;
  const entry = profileDevice(profile, devices);
  if (!entry) return null;
  return defaultCoreBindings(resolveDeviceFromEntry(entry).controls);
};

export { resolveCoreBindings };
