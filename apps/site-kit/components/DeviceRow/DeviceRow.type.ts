/* @layer site-kit @kind types */
import type { Device } from '@rotp/hub-contracts';

type DeviceRowProps = {
  device: Device;
  busy: boolean;
  onRevoke: (id: string) => void;
};

export type { DeviceRowProps };
