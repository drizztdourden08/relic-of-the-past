/* @layer renderer-app @kind types */
import type { SettingsInput } from '@drizztdourden08/tessera/composites';
import type { ControlContext } from '../settings-controls.type';

type DeviceKey = 'audioFreq' | 'audioChannels' | 'audioSamples';

interface AudioDeviceRowProps extends ControlContext {
  settingKey: DeviceKey;
}

interface DeviceRowLook {
  input: SettingsInput;
  description: string;
}

export type { AudioDeviceRowProps, DeviceKey, DeviceRowLook };
