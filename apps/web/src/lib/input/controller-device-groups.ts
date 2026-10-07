/* @layer renderer-lib @kind logic */
/**
 * Groups the controller snapshot by vendor:product id so a device that
 * presents one entry per port (an adapter) renders as a single group with a
 * port list, instead of several near-identical entries. The main process
 * already disambiguates ports with a "#N" deviceKey suffix for the second
 * and later device sharing a vid:pid (see sdl3-device-key.ts). This reads
 * that back out to number the ports, falling back to arrival order for the
 * rare case a port has no suffix to read (e.g. several unclaimed listed
 * devices sharing a vid:pid, which never get a suffix since only SDL-claimed
 * devices go through the assigner).
 */
import type { DeviceEntry } from '@shared/ipc';

interface ControllerPort {
  deviceKey: string;
  portNumber: number;
  entry: DeviceEntry;
}

interface ControllerDeviceGroup {
  vendorId: number;
  productId: number;
  product: string;
  busType: DeviceEntry['busType'];
  isAdapter: boolean;
  ports: ControllerPort[];
}

const portSuffixOf = (deviceKey: string): number | null => {
  const match = /#(\d+)$/.exec(deviceKey);
  return match ? Number(match[1]) : null;
};

const groupKeyOf = (entry: DeviceEntry): string => `${entry.vendorId}:${entry.productId}`;

/** An unclaimed entry's `product` can be blank when the lister found no
 *  metadata for it, so fall back to the first group member that has one. */
const productNameOf = (entries: readonly DeviceEntry[]): string =>
  entries.find((e) => e.product)?.product ?? 'Unknown controller';

const busTypeOf = (entries: readonly DeviceEntry[]): DeviceEntry['busType'] =>
  entries.find((e) => e.busType !== 'unknown')?.busType ?? 'unknown';

const groupControllerDevices = (entries: readonly DeviceEntry[]): ControllerDeviceGroup[] => {
  const byKey = new Map<string, DeviceEntry[]>();
  for (const entry of entries) {
    const key = groupKeyOf(entry);
    const group = byKey.get(key);
    if (group) group.push(entry);
    else byKey.set(key, [entry]);
  }

  return Array.from(byKey.values()).map((group) => ({
    vendorId: group[0].vendorId,
    productId: group[0].productId,
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
