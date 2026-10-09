/* @layer shared-types @kind types */
import type { ButtonIcon, ButtonMapping, DeviceFamily, InputApi, CoreBindings, ModernBindings } from '@rotp/game-data';

interface InputProfile {
  id: string;
  name: string;
  deviceType: 'gamepad' | 'keyboard';
  deviceFamily: DeviceFamily;
  mappings: ButtonMapping[];
  isDefault: boolean;
  assignedDevice: AssignedDevice | null;
  createdAt: number;
  modifiedAt: number;
  modern?: ModernBindings;
  core?: CoreBindings;
}

interface DetectedDevice {
  id: string;
  type: 'gamepad' | 'keyboard';
  rawId: string;
  vendorId: string | null;
  productId: string | null;
  deviceFamily: DeviceFamily;
  displayName: string;
  sdlType: string | null;
  connected: boolean;
  activated: boolean;
  brandLogoKey: string | null;
  inputApi: InputApi;
  hasRumble: boolean;
  hasGyro: boolean;
}

interface AssignedDevice {
  vendorId: string;
  productId: string;
  displayName: string;
  deviceFamily: DeviceFamily;
}

interface DevicePreset {
  id: string;
  name: string;
  family: DeviceFamily;
  inputApi: InputApi;
  vendorIds: string[];
  productIds: string[];
  defaultMappings: ButtonMapping[];
  brandLogoKey: string | null;
  buttonIcons: Partial<Record<string, ButtonIcon>>;
}

export type { AssignedDevice, DetectedDevice, DevicePreset, InputProfile };
