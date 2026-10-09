/* @layer renderer-components @kind logic */
import type { ResolvedControl } from '@shared/input/family';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { InputProfile } from '@shared/types/controls/devices/devices.type';
import { controlsForDevice } from './profile-controls';

const controlsForProfile = (profile: InputProfile | null, entries: readonly DeviceEntry[]): ResolvedControl[] => {
  if (!profile || profile.deviceType === 'keyboard') return [];
  const assigned = profile.assignedDevice;
  if (!assigned?.vendorId || !assigned.productId) return [];
  return controlsForDevice({ vid: assigned.vendorId, pid: assigned.productId }, entries);
};

export { controlsForProfile };
