/* @layer renderer-lib @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { InputProfile } from '../../controls/devices/devices.type';
import { padHex } from '../profile-devices';

const deviceKeyOfEntry = (entry: DeviceEntry): string =>
  `${padHex(entry.vendorId.toString(16))}:${padHex(entry.productId.toString(16))}`;

const profileDevice = (profile: InputProfile, devices: readonly DeviceEntry[]): DeviceEntry | null => {
  const assigned = profile.assignedDevice;
  if (!assigned) return null;
  const wanted = `${padHex(assigned.vendorId)}:${padHex(assigned.productId)}`;
  return devices.find((d) => (d.deviceKey ?? deviceKeyOfEntry(d)) === wanted) ?? null;
};

export { profileDevice };
