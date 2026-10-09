/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { AudioDeviceRow } from './AudioDeviceRow';
import { MsuFormatRow } from './MsuFormatRow';
import { VolumeRow } from './VolumeRow';
import { DEVICE_KEYS, VOLUME_ROWS } from './audio-controls.constants';
import type { ControlContext } from '../settings-controls.type';
import type { DeviceKey, VolumeKey } from './audio.type';

const isVolumeKey = (key: string): key is VolumeKey => key in VOLUME_ROWS;

const renderAudioControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (DEVICE_KEYS.includes(key)) return createElement(AudioDeviceRow, { settingKey: key as DeviceKey, ...ctx });
  if (key === 'enableMSU') return createElement(MsuFormatRow, ctx);
  return isVolumeKey(key) ? createElement(VolumeRow, { settingKey: key, ...ctx }) : null;
};

export { renderAudioControl };
