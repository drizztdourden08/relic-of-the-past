/* @layer renderer-components @kind logic */
import type { DeviceEntry, MappingEntry } from '@drizztdourden08/brock-input';
import { padDisplayName } from '@app/input/controller-names/pad-display-name';
import type { DirectoryRow } from '../ControllerDirectory.type';
import { mappingOf } from './mapping-of';
import { vidPidKey } from './vid-pid-key';

const connectedRows = (devices: readonly DeviceEntry[], mappings: readonly MappingEntry[]): DirectoryRow[] =>
  devices.map((device) => ({
    id: `connected:${device.deviceKey}`,
    name: padDisplayName(device),
    vidPid: vidPidKey(device.vendorId, device.productId),
    family: device.family ?? mappingOf(device, mappings)?.family ?? 'generic',
    group: 'Connected',
    connectedKey: device.deviceKey,
  }));

export { connectedRows };
