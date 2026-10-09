/* @layer renderer-components @kind types */
import type { DeviceEntry } from '@shared/ipc';
import type { DevicePreset } from '@shared/types/controls';
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
