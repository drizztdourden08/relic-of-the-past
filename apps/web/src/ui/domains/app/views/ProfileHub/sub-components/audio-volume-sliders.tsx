/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { VolumeControl } from '@drizztdourden08/tessera/composites';

const renderVolumeSlider = (
  key: string,
  settings: GameSettings,
  onChange: (patch: Partial<GameSettings>) => void,
): ReactNode | null => {
  switch (key) {
    case 'masterVolume':
      return (
        <VolumeControl
          label="Master Volume"
          description="Controls the overall game volume, so it affects all audio output"
          value={settings.masterVolume ?? 100}
          step={5}
          showValue
          onChange={(v) => onChange({ masterVolume: v })}
        />
      );
    case 'musicVolume':
      return (
        <VolumeControl
          label="Music Volume"
          description="Sets the music level for the original soundtrack and any music pack alike, since a pack plays in place of it, not alongside it"
          value={settings.musicVolume ?? 100}
          step={5}
          showValue
          onChange={(v) => onChange({ musicVolume: v })}
          muted={settings.musicMuted}
          onMutedChange={(musicMuted) => onChange({ musicMuted })}
          disabled={!settings.perGroupVolume}
        />
      );
    case 'ambientVolume':
      return (
        <VolumeControl
          label="Ambience Volume"
          description="Sets the replacement ambient-bed level for rain, waterfalls and wind played by a pack. The sound chip cannot split its own ambience, so this governs replacement audio only"
          value={settings.ambientVolume ?? 100}
          step={5}
          showValue
          onChange={(v) => onChange({ ambientVolume: v })}
          muted={settings.ambientMuted}
          onMutedChange={(ambientMuted) => onChange({ ambientMuted })}
          disabled={!settings.perGroupVolume}
        />
      );
    case 'sfxVolume':
      return (
        <VolumeControl
          label="SFX Volume"
          description="Sets the sound-effects level"
          value={settings.sfxVolume ?? 100}
          step={5}
          showValue
          onChange={(v) => onChange({ sfxVolume: v })}
          muted={settings.sfxMuted}
          onMutedChange={(sfxMuted) => onChange({ sfxMuted })}
          disabled={!settings.perGroupVolume}
        />
      );
    default:
      return null;
  }
};

export { renderVolumeSlider };
