/* @layer renderer-components @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { MappingDbEntry } from '../ControllerDirectory.type';
import { vidPidKey } from './vid-pid-key';

const connectedKeyOf = (entry: MappingDbEntry, connected: readonly DeviceEntry[]): string | null => {
  const key = vidPidKey(entry.vendorId, entry.productId);
  const match = connected.find((device) => device.guid === entry.guid)
    ?? connected.find((device) => vidPidKey(device.vendorId, device.productId) === key);
  return match?.deviceKey ?? null;
};

export { connectedKeyOf };
