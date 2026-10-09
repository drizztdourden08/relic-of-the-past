/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import { VolumeControl } from '@drizztdourden08/tessera/composites';
import { AudioDeviceRow } from './AudioDeviceRow';
import { MsuFormatRow } from './MsuFormatRow';
import { DEVICE_KEYS } from './audio-controls.constants';
import type { ControlContext } from '../settings-controls.type';
import type { DeviceKey } from './audio.type';

const renderVolume = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  switch (key) {
    case 'masterVolume':
      return <VolumeControl label="Master Volume" description="Controls the overall game volume, so it affects all audio output" value={settings.masterVolume ?? 100} step={5} showValue onChange={(masterVolume) => onChange({ masterVolume })} />;
    case 'musicVolume':
      return (
        <VolumeControl
          label="Music Volume" description="Sets the music level for the original soundtrack and any music pack alike, since a pack plays in place of it, not alongside it"
          value={settings.musicVolume ?? 100} step={5} showValue onChange={(musicVolume) => onChange({ musicVolume })}
          muted={settings.musicMuted} onMutedChange={(musicMuted) => onChange({ musicMuted })} disabled={disabled}
        />
      );
    case 'ambientVolume':
      return (
        <VolumeControl
          label="Ambience Volume" description="Sets the replacement ambient-bed level for rain, waterfalls and wind played by a pack. The sound chip cannot split its own ambience, so this governs replacement audio only"
          value={settings.ambientVolume ?? 100} step={5} showValue onChange={(ambientVolume) => onChange({ ambientVolume })}
          muted={settings.ambientMuted} onMutedChange={(ambientMuted) => onChange({ ambientMuted })} disabled={disabled}
        />
      );
    case 'sfxVolume':
      return (
        <VolumeControl
          label="SFX Volume" description="Sets the sound-effects level"
          value={settings.sfxVolume ?? 100} step={5} showValue onChange={(sfxVolume) => onChange({ sfxVolume })}
          muted={settings.sfxMuted} onMutedChange={(sfxMuted) => onChange({ sfxMuted })} disabled={disabled}
        />
      );
    default:
      return null;
  }
};

const renderAudioControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (DEVICE_KEYS.includes(key)) return <AudioDeviceRow settingKey={key as DeviceKey} {...ctx} />;
  if (key === 'enableMSU') return <MsuFormatRow {...ctx} />;
  return renderVolume(key, ctx);
};

export { renderAudioControl };
