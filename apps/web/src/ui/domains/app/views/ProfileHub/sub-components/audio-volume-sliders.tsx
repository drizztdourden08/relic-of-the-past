/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Slider } from '@drizztdourden08/tessera/primitives';

const renderVolumeSlider = (
  key: string,
  settings: GameSettings,
  onChange: (patch: Partial<GameSettings>) => void,
): ReactNode | null => {
  switch (key) {
    case 'masterVolume':
      return (
        <Slider
          label="Master Volume"
          description="Controls the overall game volume, so it affects all audio output"
          value={settings.masterVolume ?? 100}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onChange({ masterVolume: v })}
          formatValue={(v) => `${v}%`}
          mute={settings.masterVolume === 0}
        />
      );
    case 'musicVolume':
      return (
        <Slider
          label="Music Volume"
          description="Sets the music level for the original soundtrack and any music pack alike, since a pack plays in place of it, not alongside it"
          value={settings.musicVolume ?? 100}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onChange({ musicVolume: v })}
          formatValue={(v) => `${v}%`}
          mute={settings.musicMuted}
          onMuteToggle={() => onChange({ musicMuted: !settings.musicMuted })}
          disabled={!settings.perGroupVolume}
        />
      );
    case 'ambientVolume':
      return (
        <Slider
          label="Ambience Volume"
          description="Sets the replacement ambient-bed level for rain, waterfalls and wind played by a pack. The sound chip cannot split its own ambience, so this governs replacement audio only"
          value={settings.ambientVolume ?? 100}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onChange({ ambientVolume: v })}
          formatValue={(v) => `${v}%`}
          mute={settings.ambientMuted}
          onMuteToggle={() => onChange({ ambientMuted: !settings.ambientMuted })}
          disabled={!settings.perGroupVolume}
        />
      );
    case 'sfxVolume':
      return (
        <Slider
          label="SFX Volume"
          description="Sets the sound-effects level"
          value={settings.sfxVolume ?? 100}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onChange({ sfxVolume: v })}
          formatValue={(v) => `${v}%`}
          mute={settings.sfxMuted}
          onMuteToggle={() => onChange({ sfxMuted: !settings.sfxMuted })}
          disabled={!settings.perGroupVolume}
        />
      );
    default:
      return null;
  }
};

export { renderVolumeSlider };
