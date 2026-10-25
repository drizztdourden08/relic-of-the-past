/* @layer renderer-components @kind logic */
import { controllerCardInfo } from '@drizztdourden08/brock-input/renderer';
import type { ControllerDeviceGroup } from '@drizztdourden08/brock-input/renderer';
import { firstPort } from './first-port';
import { ADAPTER_FAMILY_ICON, BUS_NAME, DEVICE_FAMILY_ICON, GENERIC_DEVICE_ICON, SDL_TYPE_ICON } from './controls.constants';
import type { DeviceEntry } from './DeviceRow.type';

const readyPorts = (group: ControllerDeviceGroup): number =>
  group.ports.filter((port) => port.entry.status === 'ready').length;

const groupMeta = (group: ControllerDeviceGroup, ready: number): string => {
  const bus = BUS_NAME[group.busType];
  if (group.isAdapter) return `${ready} of ${group.ports.length} ports ready`;
  const status = ready > 0 ? 'Ready' : 'Unavailable';
  return bus ? `${status}, ${bus}` : status;
};

const iconOf = (group: ControllerDeviceGroup, family: string, sdlType: string | null): string => {
  if (group.isAdapter) return ADAPTER_FAMILY_ICON[family] ?? GENERIC_DEVICE_ICON;
  return (sdlType && SDL_TYPE_ICON[sdlType]) ?? DEVICE_FAMILY_ICON[family] ?? GENERIC_DEVICE_ICON;
};

const controllerGroupEntry = (group: ControllerDeviceGroup): DeviceEntry => {
  const { entry, deviceKey } = firstPort(group);
  const { displayName, deviceFamily, sdlType, vendorId, productId } = controllerCardInfo(entry);
  const id = group.isAdapter ? `adapter-${vendorId}-${productId}` : deviceKey;
  const ready = readyPorts(group);
  return {
    key: id,
    drag: { id, displayName, sdlType, vendorId, productId },
    family: deviceFamily,
    iconSrc: iconOf(group, deviceFamily, sdlType),
    meta: groupMeta(group, ready),
    ready: ready > 0,
    unavailable: group.ports.some((port) => port.entry.status === 'unavailable'),
  };
};

export { controllerGroupEntry };
