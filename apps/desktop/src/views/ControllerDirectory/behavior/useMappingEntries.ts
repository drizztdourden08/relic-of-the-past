/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { MappingDbEntry, MappingEntries } from '../ControllerDirectory.type';

const entryOfDevice = (device: DeviceEntry): MappingDbEntry => ({
  guid: device.guid ?? device.deviceKey,
  name: device.name ?? device.product,
  vendorId: device.vendorId,
  productId: device.productId,
  family: device.family ?? 'generic',
  source: 'sdl',
  mapping: device.mapping ?? '',
});

const useMappingEntries = (connected: readonly DeviceEntry[]): MappingEntries =>
  useMemo(() => ({ entries: connected.map(entryOfDevice), complete: false }), [connected]);

export { useMappingEntries };
