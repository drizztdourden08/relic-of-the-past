/* @layer renderer-app @kind types */
import type { SettingsInput } from '@drizztdourden08/tessera/composites';
import type { ControlContext } from '../settings-controls.type';
import type { VOLUME_ROWS } from './audio-controls.constants';

type DeviceKey = 'audioFreq' | 'audioChannels' | 'audioSamples';

type VolumeKey = keyof typeof VOLUME_ROWS;

interface AudioDeviceRowProps extends ControlContext {
  settingKey: DeviceKey;
}

interface VolumeRowProps extends ControlContext {
  settingKey: VolumeKey;
}

interface DeviceRowLook {
  input: SettingsInput;
  description: string;
}

export type { AudioDeviceRowProps, DeviceKey, DeviceRowLook, VolumeKey, VolumeRowProps };
