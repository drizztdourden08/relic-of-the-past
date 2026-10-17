/* @layer renderer-components @kind types */
import type { DeviceDragInfo } from './controls.type';

interface DeviceAssignInfo {
  sdlType: string | null;
  displayName: string;
  vendorId: string | null;
  productId: string | null;
}

interface DeviceEntry {
  key: string;
  drag: DeviceDragInfo;
  family: string;
  iconSrc: string;
  meta: string;
  ready: boolean;
  unavailable: boolean;
}

interface DeviceRowProps {
  entry: DeviceEntry;
  onAssign: (device: DeviceAssignInfo) => void;
  onAddMapping: (mapping: string) => Promise<boolean>;
}

interface DeviceRailButtonProps {
  entry: DeviceEntry;
  onAssign: (device: DeviceAssignInfo) => void;
}

interface DeviceIconProps {
  src: string;
  family: string;
  ready: boolean;
}

export type { DeviceAssignInfo, DeviceEntry, DeviceIconProps, DeviceRailButtonProps, DeviceRowProps };
