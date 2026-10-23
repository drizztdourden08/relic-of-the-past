/* @layer renderer-components @kind logic */
import type { ControllerDeviceGroup } from '@rotp/input-mapping';
import type { PadNavEntry } from '../ControllerPads.type';

const entryLabel = (group: ControllerDeviceGroup, portNumber: number): string =>
  group.isAdapter ? `${group.product} (port ${portNumber})` : group.product;

const padNavEntries = (groups: readonly ControllerDeviceGroup[]): PadNavEntry[] =>
  groups.flatMap((group) =>
    group.ports.map((port) => ({
      id: port.deviceKey,
      label: entryLabel(group, port.portNumber),
      connected: port.entry.status === 'ready',
    })),
  );

export { padNavEntries };
