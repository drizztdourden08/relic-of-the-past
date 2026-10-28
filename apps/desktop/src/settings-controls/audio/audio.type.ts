/* @layer renderer-app @kind types */
import type { ControlContext } from '../settings-controls.type';
import type { VOLUME_MUTED_KEYS } from './audio-controls.constants';

type DeviceKey = 'audioFreq' | 'audioChannels' | 'audioSamples';

type VolumeKey = keyof typeof VOLUME_MUTED_KEYS;

interface AudioDeviceControlProps extends ControlContext {
  settingKey: DeviceKey;
}

interface VolumeInputProps extends ControlContext {
  settingKey: VolumeKey;
}

export type { AudioDeviceControlProps, DeviceKey, VolumeKey, VolumeInputProps };
