/* @layer renderer-components @kind logic */
import type { DirectoryRow, MappingDbEntry } from '../ControllerDirectory.type';
import { mappingInputs } from './mapping-inputs';
import { vidPidKey } from './vid-pid-key';

const directoryRowOf = (entry: MappingDbEntry, connectedKey: string | null): DirectoryRow => ({
  id: entry.guid,
  name: entry.name,
  vidPid: vidPidKey(entry.vendorId, entry.productId),
  family: entry.family,
  source: entry.source,
  inputs: mappingInputs(entry.mapping),
  group: connectedKey === null ? 'Known' : 'Connected',
  connectedKey,
});

export { directoryRowOf };
