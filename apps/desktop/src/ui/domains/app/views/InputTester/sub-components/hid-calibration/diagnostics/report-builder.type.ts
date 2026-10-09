/* @layer renderer-components @kind types */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { DevicePreset } from '@shared/types/controls/devices/devices.type';
import type { NativeCaptureStatus } from './hooks/useNativeCaptures.type';

interface BuildReportArgs {
  deviceKey: string;
  name: string;
  deviceEntry: DeviceEntry | null;
  preset: DevicePreset | null;
  nativeStatus: NativeCaptureStatus;
  platform: string;
  appVersion: string;
}

export type { BuildReportArgs };
