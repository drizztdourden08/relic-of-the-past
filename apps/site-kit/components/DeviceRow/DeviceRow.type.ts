/* @layer site-kit @kind types */
import type { Device } from '@shared/hub/device-types';

type DeviceRowProps = {
  device: Device;
  busy: boolean;
  onRevoke: (id: string) => void;
};

export type { DeviceRowProps };
