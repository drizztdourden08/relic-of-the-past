/* @layer electron-main @kind types */
import type { DeviceStatus } from '@shared/ipc/controller-contract';
import type { ListedDevice } from './device-lister.type';

interface ClassifiedDevice extends ListedDevice {
  status: DeviceStatus;
}

export type { ClassifiedDevice };
