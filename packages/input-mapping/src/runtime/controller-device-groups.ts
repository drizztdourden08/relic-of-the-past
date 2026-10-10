/* @layer renderer-lib @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { ControllerDeviceGroup, ControllerPort } from './controller-device-groups.type';

const portSuffixOf = (deviceKey: string): number | null => {
  const match = /#(\d+)$/.exec(deviceKey);
  return match ? Number(match[1]) : null;
};

const groupKeyOf = (entry: DeviceEntry): string => `${entry.vendorId}:${entry.productId}`;

const productNameOf = (entries: readonly DeviceEntry[]): string =>
  entries.find((e) => e.product)?.product ?? 'Unknown controller';

const busTypeOf = (entries: readonly DeviceEntry[]): DeviceEntry['busType'] =>
  entries.find((e) => e.busType !== 'unknown')?.busType ?? 'unknown';

const firstOf = (group: readonly DeviceEntry[]): DeviceEntry => {
  const [first] = group;
  if (first === undefined) throw new Error('A controller group has no devices');
  return first;
};

const groupControllerDevices = (entries: readonly DeviceEntry[]): ControllerDeviceGroup[] => {
  const byKey = new Map<string, DeviceEntry[]>();
  for (const entry of entries) {
    const key = groupKeyOf(entry);
    const group = byKey.get(key);
    if (group) group.push(entry);
    else byKey.set(key, [entry]);
  }

  return Array.from(byKey.values()).map((group) => ({
    vendorId: firstOf(group).vendorId,
    productId: firstOf(group).productId,
    product: productNameOf(group),
    busType: busTypeOf(group),
    isAdapter: group.length > 1,
    ports: group
      .map((entry, index) => ({ deviceKey: entry.deviceKey, portNumber: portSuffixOf(entry.deviceKey) ?? index + 1, entry }))
      .sort((a, b) => a.portNumber - b.portNumber),
  }));
};

export { groupControllerDevices };
export type { ControllerDeviceGroup, ControllerPort };
