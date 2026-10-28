/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { AudioDeviceControl } from './AudioDeviceControl';
import { MsuFormatControl } from './MsuFormatControl';
import { VolumeInput } from './VolumeInput';
import { DEVICE_KEYS, VOLUME_MUTED_KEYS } from './audio-controls.constants';
import type { ControlContext } from '../settings-controls.type';
import type { DeviceKey, VolumeKey } from './audio.type';

const isVolumeKey = (key: string): key is VolumeKey => key in VOLUME_MUTED_KEYS;

const renderAudioControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (DEVICE_KEYS.includes(key)) return createElement(AudioDeviceControl, { settingKey: key as DeviceKey, ...ctx });
  if (key === 'enableMSU') return createElement(MsuFormatControl, ctx);
  return isVolumeKey(key) ? createElement(VolumeInput, { settingKey: key, ...ctx }) : null;
};

export { renderAudioControl };
