/* @layer shared-input @kind types */
import type { DeviceFamily, InputApi } from '@rotp/game-data';
import type { SdlGamepadType } from '@rotp/game-data';

interface DeviceProfileButton {
  id: string;
  label: string;
  icon: string;
  category: 'face' | 'shoulder' | 'trigger' | 'dpad' | 'stick' | 'system';
}

interface DeviceProfileAxis {
  id: string;
  label: string;
  icon: string;
  category: 'stick' | 'trigger';
}

interface DeviceProfile {
  id: string;
  name: string;
  vendorId: string | null;
  productId: string | null;
  family: DeviceFamily;
  inputApi: InputApi;
  buttons: DeviceProfileButton[];
  axes: DeviceProfileAxis[];
  buttonsByIndex: Record<number, { icon: string; label: string }>;
}

interface DeviceProfileIdentity {
  id: string;
  name: string;
  family: DeviceFamily;
  inputApi: InputApi;
  vendorId?: string;
  productId?: string;
}

interface LiveCapabilities {
  sdlType: SdlGamepadType;
  hasButton: readonly boolean[];
  hasAxis: readonly boolean[];
  buttonLabels?: readonly string[];
}

export type { DeviceProfile, DeviceProfileAxis, DeviceProfileButton, DeviceProfileIdentity, LiveCapabilities };
