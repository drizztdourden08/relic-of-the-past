/* @layer renderer-components @kind logic */
import type { DeviceEntry, MappingEntry } from '@drizztdourden08/brock-input';

const mappingOf = (device: DeviceEntry, mappings: readonly MappingEntry[]): MappingEntry | undefined =>
  mappings.find((entry) => device.guid !== undefined && entry.guid === device.guid)
  ?? mappings.find((entry) => entry.vid === device.vendorId && entry.pid === device.productId);

export { mappingOf };
