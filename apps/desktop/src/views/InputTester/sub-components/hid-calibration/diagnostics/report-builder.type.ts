/* @layer renderer-components @kind types */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { DevicePreset } from '@rotp/input-mapping';
import type { NativeCaptureStatus } from './native-captures.type';

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
