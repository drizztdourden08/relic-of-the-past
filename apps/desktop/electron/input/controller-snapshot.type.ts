/* @layer electron-main @kind types */
import type { ControllerConnectionState, ControllerGamepadType } from '@shared/ipc/controller-contract';

interface LiveDevice {
  deviceKey: string;
  name: string;
  sdlId: number;
  vendorId: number;
  productId: number;
  guid: string;
  mapping: string | null;
  hasRumble: boolean;
  hasGyro: boolean;
  connectionState: ControllerConnectionState;
  sdlType: ControllerGamepadType;
  hasButton: boolean[];
  hasAxis: boolean[];
  buttonLabels: string[];
}

export type { LiveDevice };
