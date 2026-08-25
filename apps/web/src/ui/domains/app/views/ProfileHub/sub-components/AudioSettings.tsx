/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { SECTIONS } from './audio-settings-sections';
import { renderControl, isDisabled } from './audio-settings-controls';
import { useMsuPackProfile } from './useMsuPackProfile';

interface AudioSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

const AudioSettings = (props: AudioSettingsProps) => {
  const { settings, onChange, profileId } = props;
  const { pack } = useMsuPackProfile(profileId);
  const boundRenderControl = useCallback(
    (key: string, s: GameSettings, change: (patch: Partial<GameSettings>) => void) => renderControl(key, s, change, pack),
    [pack],
  );
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={boundRenderControl}
      isDisabled={isDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { AudioSettings };
