/* @layer renderer-components @kind logic */
import type { ResolvedControl } from '@shared/input/family';
import type { DeviceEntry } from '@shared/ipc';
import type { InputProfile } from '@shared/types/controls';
import { controlsForDevice } from './profile-controls';

const controlsForProfile = (profile: InputProfile | null, entries: readonly DeviceEntry[]): ResolvedControl[] => {
  if (!profile || profile.deviceType === 'keyboard') return [];
  const assigned = profile.assignedDevice;
  if (!assigned?.vendorId || !assigned.productId) return [];
  return controlsForDevice({ vid: assigned.vendorId, pid: assigned.productId }, entries);
};

export { controlsForProfile };
